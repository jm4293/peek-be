import { Cache } from 'cache-manager';
import { Request } from 'express';
import { catchError, firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';

import { BcryptHandler } from '@peek/handler/bcrypt';

import { UserAccountStatusEnum, UserAccountTypeEnum } from '@constant/enum/user';

import { Board, BoardComment } from '@database/entities/board';
import { User, UserAccount, UserNotification, UserPushToken } from '@database/entities/user';
import {
  UserAccountRepository,
  UserNotificationRepository,
  UserOauthTokenRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@database/repositories/user';

import { CheckEmailCodeDto, CheckEmailDto } from '../auth/dto';
import { AWSService } from '../aws';
import { EmailVerificationService } from '../email-verification';
import {
  ReadUserNotificationDto,
  RegisterUserPushTokenDto,
  ResetUserPasswordDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
  UpdateUserThumbnailDto,
} from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly awsService: AWSService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,

    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userPushTokenRepository: UserPushTokenRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
    private readonly userVisitRepository: UserVisitRepository,
    private readonly userOauthTokenRepository: UserOauthTokenRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getMyInfo(accountId: number) {
    return await this.userAccountRepository.findById(accountId);
  }

  async updateUser(params: { dto: UpdateUserDto; accountId: number }) {
    const { dto, accountId } = params;

    const { user } = await this.userAccountRepository.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    user.nickname = dto.nickname;
    // user.name = dto.name;
    // user.birthday = dto.birthday;
    // user.thumbnail = dto.thumbnail;

    await this.userRepository.save(user);
  }

  async updateThumbnail(params: { dto: UpdateUserThumbnailDto; accountId: number }) {
    const { dto, accountId } = params;
    const { thumbnail } = dto;

    const { user } = await this.userAccountRepository.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    user.thumbnail = thumbnail;

    await this.userRepository.save(user);
  }

  async checkEmail(dto: CheckEmailDto) {
    const { email } = dto;

    const userAccount = await this.userAccountRepository.findOne({ where: { email } });

    try {
      if (!userAccount) {
        throw new BadRequestException('이메일이 존재하지 않습니다.');
      }

      if (userAccount.userAccountType !== UserAccountTypeEnum.EMAIL) {
        throw new BadRequestException('이메일로 가입한 회원이 아닙니다.');
      }

      await this.emailVerificationService.sendVerificationCode(email);
    } catch (error) {
      throw error;
    }
  }

  async checkEmailCode(dto: CheckEmailCodeDto) {
    const { email, code } = dto;

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const cacheKey = `email_verification_code_${email}`;

    try {
      await this.cacheManager.set(cacheKey, randomCode, 300000); // 5분
      await this.emailVerificationService.verifyCode(email, code);

      return { success: true, randomCode };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(dto: ResetUserPasswordDto) {
    const { email, code, password } = dto;

    const cacheKey = `email_verification_code_${email}`;
    const cachedCode = await this.cacheManager.get<string>(cacheKey);

    if (!cachedCode) {
      throw new BadRequestException('비정상적인 접근입니다. 다시 시도해주세요.');
    }

    if (cachedCode !== code) {
      throw new BadRequestException('비정상적인 접근입니다. 다시 시도해주세요.');
    }

    await this.userAccountRepository.update({ email }, { password: await BcryptHandler.hashPassword(password) });
  }

  async updatePassword(params: { dto: UpdateUserPasswordDto; accountId: number }) {
    const { dto, accountId } = params;
    const { password, newPassword } = dto;

    const userAccount = await this.userAccountRepository.findById(accountId);

    const isMatch = await BcryptHandler.comparePassword(password, userAccount.password);

    if (!isMatch) {
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
    }

    userAccount.password = await BcryptHandler.hashPassword(newPassword);

    await this.userAccountRepository.save(userAccount);
  }

  async deleteUser(accountId: number) {
    const { userId, userAccountType } = await this.userAccountRepository.findById(accountId);

    const accountList = await this.userAccountRepository.find({ where: { userId } });
    const oauthToken = await this.userOauthTokenRepository.findOne({ where: { userAccountId: accountId } });

    try {
      if (oauthToken) {
        const { tokenType, accessToken } = oauthToken;

        switch (userAccountType) {
          case UserAccountTypeEnum.GOOGLE: {
            const ret = await firstValueFrom(
              this.httpService.post(`https://oauth2.googleapis.com/revoke?token=${accessToken}`).pipe(
                catchError((error) => {
                  throw new BadRequestException(`구글 회원 탈퇴에 실패했습니다: ${error.message}`);
                }),
              ),
            );

            break;
          }
          case UserAccountTypeEnum.KAKAO: {
            const user = await firstValueFrom(
              this.httpService
                .get<{
                  id: string;
                }>(
                  `https://kapi.kakao.com/v2/user/me?secure_resource=${this.configService.get('NODE_ENV') === 'production' ? 'true' : 'false'}`,
                  {
                    headers: {
                      Authorization: `${tokenType} ${accessToken}`,
                      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    },
                  },
                )
                .pipe(
                  catchError((error) => {
                    throw new BadRequestException(`카카오 회원 탈퇴에 실패했습니다: ${error.message}`);
                  }),
                ),
            );

            await firstValueFrom(
              this.httpService
                .post(
                  'https://kapi.kakao.com/v1/user/unlink',
                  {
                    target_id_type: 'user_id',
                    target_id: user.data.id,
                  },
                  {
                    headers: {
                      Authorization: `${tokenType} ${accessToken}`,
                    },
                  },
                )
                .pipe(
                  catchError((error) => {
                    throw new BadRequestException(`카카오 회원 탈퇴에 실패했습니다: ${error.message}`);
                  }),
                ),
            );

            break;
          }
          case UserAccountTypeEnum.NAVER: {
            const ret = await firstValueFrom(
              this.httpService
                .post(
                  `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${this.configService.get('NAVER_CLIENT_ID')}&client_secret=${this.configService.get('NAVER_CLIENT_SECRET')}&access_token=${encodeURIComponent(accessToken)}&service_provider=NAVER`,
                )
                .pipe(
                  catchError((error) => {
                    throw new BadRequestException(`네이버 회원 탈퇴에 실패했습니다: ${error.message}`);
                  }),
                ),
            );

            break;
          }
          default: {
            break;
          }
        }

        await this.userOauthTokenRepository.delete({ userAccountId: accountId });
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.update(Board, { userAccountId: accountId }, { deletedAt: new Date() });
        await manager.update(BoardComment, { userAccountId: accountId }, { deletedAt: new Date() });
        await manager.update(
          UserAccount,
          { id: accountId },
          {
            password: null,
            refreshToken: null,
            status: UserAccountStatusEnum.DELETE,
            deletedAt: new Date(),
          },
        );

        if (accountList.length === 1) {
          const account = accountList[0];

          await manager.delete(UserNotification, { userId: account.userId });
          await manager.delete(UserPushToken, { userId: account.userId });
          await manager.update(
            User,
            { id: account.userId },
            {
              nickname: null,
              name: null,
              birthday: null,
              thumbnail: null,
              deletedAt: new Date(),
            },
          );
        }
      });

      console.info('회원 탈퇴이 완료되었습니다:', accountId);
    } catch (error) {
      throw new BadRequestException('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
    }
  }

  async registerPushToken(params: { dto: RegisterUserPushTokenDto; req: Request }) {
    // const { dto, req } = params;
    // const { pushToken } = dto;
    // const { userSeq } = req.user;
    // const { 'sec-ch-ua-platform': platform } = req.headers;
    //
    // const user = await this.userRepository.findByUserSeq(userSeq);
    //
    // const userPushToken = await this.userPushTokenRepository.findOne({ where: { user: { userSeq } } });
    //
    // if (userPushToken) {
    //   userPushToken.pushToken = pushToken;
    //   userPushToken.deviceNo = String(platform);
    //
    //   await this.userPushTokenRepository.save(userPushToken);
    // } else {
    //   await this.userPushTokenRepository.save({ user, pushToken, deviceNo: String(platform) });
    // }
  }

  async getNotificationList(params: { page: number; req: Request }) {
    // const { page, req } = params;
    // const { userSeq } = req.user;
    //
    // const LIMIT = 5;
    //
    // const queryBuilder = this.userNotificationRepository
    //   .createQueryBuilder('userNotification')
    //   .leftJoinAndSelect('userNotification.user', 'user')
    //   .where('userNotification.user = :userSeq', { userSeq })
    //   .andWhere('userNotification.isDeleted = false')
    //   .orderBy('userNotification.createdAt', 'DESC')
    //   .skip((page - 1) * LIMIT)
    //   .take(LIMIT);
    //
    // const [notifications, total] = await queryBuilder.getManyAndCount();
    //
    // const hasNextPage = page * LIMIT < total;
    // const nextPage = hasNextPage ? page + 1 : null;
    //
    // return { notifications, total, nextPage };
  }

  async readNotification(params: { dto: ReadUserNotificationDto; req: Request }) {
    // const { dto, req } = params;
    //
    // const { userNotificationSeq } = dto;
    // const { userSeq } = req.user;
    //
    // await this.userRepository.findByUserSeq(userSeq);
    //
    // const notification = await this.userNotificationRepository.findOne({
    //   where: { user: { userSeq }, userNotificationSeq },
    // });
    //
    // if (!notification) {
    //   throw new BadRequestException('알림이 존재하지 않습니다.');
    // }
    //
    // notification.isRead = true;
    //
    // await this.userNotificationRepository.save(notification);
  }

  async readAllNotification(req: Request) {
    // const { userSeq } = req.user;
    //
    // await this.userRepository.findByUserSeq(userSeq);
    //
    // await this.userNotificationRepository.update({ user: { userSeq }, isRead: false }, { isRead: true });
  }

  async deleteNotification(params: { userNotificationSeq: number; req: Request }) {
    // const { userNotificationSeq, req } = params;
    // const { userSeq } = req.user;
    //
    // await this.userRepository.findByUserSeq(userSeq);
    //
    // await this.userNotificationRepository.update({ userNotificationSeq }, { isDeleted: true, deletedAt: new Date() });
  }

  private async _oauthDeleteAccount(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      // throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }
}
