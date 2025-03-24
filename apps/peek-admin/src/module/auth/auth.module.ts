import { Module } from '@nestjs/common';

import { UserAccountRepository } from '@libs/database/repositories';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UserAccountRepository],
  exports: [],
})
export class AuthModule {}
