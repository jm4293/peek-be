import { Cache } from 'cache-manager';
import { Request } from 'express';
import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';

import { BcryptHandler } from '@peek/handler/bcrypt';

import {
  UserAccountRepository,
  UserNotificationRepository,
  UserOauthTokenRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@libs/database/repositories/user';

import { EntityName } from '@libs/shared/const/entity';
import { UserAccountType } from '@libs/shared/const/user';

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

  async getUserInfo(accountId: number) {
    return await this.userAccountRepository.findById(accountId);
  }

  async updateUser(params: { dto: UpdateUserDto; accountId: number }) {
    const { dto, accountId } = params;

    const { user } = await this.userAccountRepository.findOne({
      where: { id: accountId },
      // relations: ['user'],
      relations: [EntityName.User],
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
      // relations: ['user'],
      relations: [EntityName.User],
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

      if (userAccount.userAccountType !== UserAccountType.EMAIL) {
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

    // const accountList = await this.userAccountRepository.find({ where: { userId } });
    const oauthToken = await this.userOauthTokenRepository.findOne({ where: { userAccountId: accountId } });

    try {
      // await this.dataSource.transaction(async (manager) => {
      //   await manager.query(
      //     'DELETE FROM board_comment WHERE boardId IN (SELECT id FROM board WHERE userAccountId = ?)',
      //     [accountId],
      //   );
      //   await manager.query(
      //     'DELETE FROM board_article WHERE boardId IN (SELECT id FROM board WHERE userAccountId = ?)',
      //     [accountId],
      //   );
      //   await manager.delete(Board, { userAccountId: accountId });
      //
      //   await manager.query(
      //     'DELETE FROM inquiry_reply WHERE inquiryId IN (SELECT id FROM inquiry WHERE userAccountId = ?)',
      //     [accountId],
      //   );
      //   await manager.query(
      //     'DELETE FROM inquiry_image WHERE inquiryId IN (SELECT id FROM inquiry WHERE userAccountId = ?)',
      //     [accountId],
      //   );
      //   await manager.delete(Inquiry, { userAccountId: accountId });
      //
      //   await manager.delete(Notice, { userAccountId: accountId });
      //
      //   await manager.delete(UserVisit, { userAccountId: accountId });
      //   await manager.delete(UserOauthToken, { userAccountId: accountId });
      //   await manager.delete(UserPushToken, { userAccountId: accountId });
      //   await manager.delete(UserNotification, { userAccountId: accountId });
      //   await manager.delete(UserAccount, { id: accountId });
      //
      //   if (accountList.length === 1) {
      //     const account = accountList[0];
      //
      //     await manager.delete(User, { id: account.userId });
      //   }
      // });

      // if (oauthToken) {
      const { tokenType, accessToken } = oauthToken;

      switch (userAccountType) {
        case UserAccountType.GOOGLE: {
          const URL = 'https://oauth2.googleapis.com/revoke';

          await this.httpService.axiosRef.post(`${URL}?token=${accessToken}`);

          break;
        }
        case UserAccountType.KAKAO: {
          const URL_ME = 'https://kapi.kakao.com/v2/user/me';
          const URL = 'https://kapi.kakao.com/v1/user/unlink';

          const user = await this.httpService.axiosRef.get<{ id: string }>(
            `${URL_ME}?secure_resource=${this.configService.get('NODE_ENV') === 'production' ? 'true' : 'false'}`,
            {
              headers: {
                Authorization: `${tokenType} ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
              },
            },
          );

          await this.httpService.axiosRef.post(
            URL,
            { target_id_type: 'user_id', target_id: user.data.id },
            { headers: { Authorization: `${tokenType} ${accessToken}` } },
          );

          break;
        }
        case UserAccountType.NAVER: {
          const URL = 'https://nid.naver.com/oauth2.0/token';

          await this.httpService.axiosRef.post(
            `${URL}?grant_type=delete&client_id=${this.configService.get('NAVER_CLIENT_ID')}&client_secret=${this.configService.get(
              'NAVER_CLIENT_SECRET',
            )}&access_token=${encodeURIComponent(accessToken)}&service_provider=NAVER`,
          );

          break;
        }
        default: {
          break;
        }
      }
      // }

      await this.userRepository.delete({ id: userId });
    } catch (error) {
      console.error('UserService deleteUser error:', error);
      throw new BadRequestException('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
    }
  }

  async registerPushToken(params: { dto: RegisterUserPushTokenDto; accountId: number; platform: string }) {
    const { dto, accountId, platform } = params;
    const { pushToken } = dto;

    const userPushToken = await this.userPushTokenRepository.findOne({ where: { userAccountId: accountId } });

    if (userPushToken) {
      await this.userPushTokenRepository.update(userPushToken.id, {
        pushToken: pushToken,
        deviceNo: String(platform),
      });
    } else {
      await this.userPushTokenRepository.save({ pushToken, deviceNo: String(platform), userAccountId: accountId });
    }
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
