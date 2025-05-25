import { Module } from '@nestjs/common';

import {
  UserAccountRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '@libs/database/repositories';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UserAccountRepository,
    // UserPushTokenRepository,
    UserNotificationRepository,
  ],
  exports: [],
})
export class UserModule {}
