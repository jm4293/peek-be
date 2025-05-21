import { Request } from 'express';

import { BadRequestException, Injectable } from '@nestjs/common';

import {
  UserAccountRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '@libs/database/repositories';

import { BcryptHandler } from '../../handler';
import {
  ReadUserNotificationDto,
  RegisterUserPushTokenDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from '../../type/dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userPushTokenRepository: UserPushTokenRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async getMyInfo(req: Request) {
    // if (!req.user) {
    //   throw new BadRequestException();
    // }
    //
    // const { userSeq, userAccountType } = req.user;
    //
    // const userAccount = await this.userAccountRepository.findOne({
    //   where: { user: { userSeq }, userAccountType },
    //   relations: ['user'],
    // });
    //
    // if (!userAccount) {
    //   throw new Error('사용자 계정이 존재하지 않습니다.');
    // }
    //
    // const { email, user } = userAccount;
    // const { nickname, name, thumbnail } = user;
    //
    // return { email, nickname, name, thumbnail, userAccountType };
  }

  async updateUser(params: { dto: UpdateUserDto; req: Request }) {
    // const { dto, req } = params;
    // const { userSeq } = req.user;
    //
    // const user = await this.userRepository.findByUserSeq(userSeq);
    //
    // user.nickname = dto.nickname;
    // user.name = dto.name;
    // user.birthday = dto.birthday;
    // user.thumbnail = dto.thumbnailUrl;
    //
    // await this.userRepository.save(user);
  }

  async updatePassword(params: { dto: UpdateUserPasswordDto; req: Request }) {
    // const { dto, req } = params;
    // const { password, newPassword } = dto;
    // const { userSeq } = req.user;
    //
    // await this.userRepository.findByUserSeq(userSeq);
    //
    // const userAccount = await this.userAccountRepository.findByUserSeq(userSeq);
    //
    // const isMatch = await BcryptHandler.comparePassword(password, userAccount.password as string);
    //
    // if (!isMatch) {
    //   throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    // }
    //
    // userAccount.password = await BcryptHandler.hashPassword(newPassword);
    //
    // await this.userAccountRepository.save(userAccount);
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

  async getNotificationList(params: { pageParam: number; req: Request }) {
    // const { pageParam, req } = params;
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
    //   .skip((pageParam - 1) * LIMIT)
    //   .take(LIMIT);
    //
    // const [notifications, total] = await queryBuilder.getManyAndCount();
    //
    // const hasNextPage = pageParam * LIMIT < total;
    // const nextPage = hasNextPage ? pageParam + 1 : null;
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
}
