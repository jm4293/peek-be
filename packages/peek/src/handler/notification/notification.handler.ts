import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotification } from '../../database/entities';
import { UserNotificationRepository } from '../../database/repository';
import { UserNotificationTypeEnum } from '../../constant/enum';

@Injectable()
export class NotificationHandler {
  constructor(
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async sendPushNotification(params: {
    pushToken: string;
    message: string;
    userNotificationType: UserNotificationTypeEnum;
    userSeq: number;
  }) {
    const { pushToken, message, userNotificationType, userSeq } = params;

    try {
      await admin.messaging().send({ token: pushToken, notification: { title: 'PEEK 알림', body: message } });

      const userNotification = this.userNotificationRepository.create({
        userNotificationType,
        message,
        user: { userSeq },
      });

      await this.userNotificationRepository.save(userNotification);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
