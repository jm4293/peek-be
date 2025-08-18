import { Module } from '@nestjs/common';

import { UserAccountRepository, UserRepository } from '@database/repositories/user';

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
    // UserPushTokenRepository,
    // UserNotificationRepository,
  ],
  exports: [],
})
export class UserModule {}
