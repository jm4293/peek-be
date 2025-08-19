import { Module } from '@nestjs/common';

import {
  UserAccountRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@database/repositories/user';

import { AWSService } from '../aws';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    AWSService,

    UserRepository,
    UserAccountRepository,
    UserPushTokenRepository,
    UserNotificationRepository,
    UserVisitRepository,
  ],
  exports: [],
})
export class UserModule {}
