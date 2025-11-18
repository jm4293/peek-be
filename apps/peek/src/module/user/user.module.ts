import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import {
  UserAccountRepository,
  UserNotificationRepository,
  UserOauthTokenRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@libs/database/repositories/user';

import { AWSService } from '../aws';
import { EmailVerificationService } from '../email-verification';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [HttpModule],
  controllers: [UserController],
  providers: [
    UserService,
    AWSService,
    EmailVerificationService,

    UserRepository,
    UserAccountRepository,
    UserPushTokenRepository,
    UserNotificationRepository,
    UserVisitRepository,
    UserOauthTokenRepository,
  ],
  exports: [UserService],
})
export class UserModule {}
