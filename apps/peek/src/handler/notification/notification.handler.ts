import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserNotificationTypeEnum } from '@constant/enum/user';

import { UserNotification } from '@database/entities/user';
import { UserNotificationRepository } from '@database/repositories/user';

@Injectable()
export class NotificationHandler {
  constructor(
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async sendPushNotification(params: {
    pushToken: string | null;
    message: string;
    userNotificationType: UserNotificationTypeEnum;
    userSeq: number;
  }) {
    const { pushToken, message, userNotificationType, userSeq } = params;

    try {
      // await admin.messaging().send({ token: pushToken, notification: { title: 'PEEK 알림', body: message } });
      //
      // const userNotification = this.userNotificationRepository.create({
      //   userNotificationType,
      //   message,
      //   user: { userSeq },
      // });
      //
      // await this.userNotificationRepository.save(userNotification);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
