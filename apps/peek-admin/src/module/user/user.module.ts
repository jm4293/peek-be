import { Module } from '@nestjs/common';

import { UserRepository } from '@libs/database/repositories/user';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [],
})
export class UserModule {}
