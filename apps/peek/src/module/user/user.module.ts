import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import {
  UserAccountRepository,
  UserNotificationRepository,
  UserOauthTokenRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@database/repositories/user';

import { AWSService } from '../aws';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [HttpModule],
  controllers: [UserController],
  providers: [
    UserService,
    AWSService,

    UserRepository,
    UserAccountRepository,
    UserPushTokenRepository,
    UserNotificationRepository,
    UserVisitRepository,
    UserOauthTokenRepository,
  ],
  exports: [],
})
export class UserModule {}
