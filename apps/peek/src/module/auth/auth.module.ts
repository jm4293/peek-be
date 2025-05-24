import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import {
  UserAccountRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@libs/database/repositories';

import { jwtModuleConfig } from '../../config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.registerAsync(jwtModuleConfig), HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    UserAccountRepository,
    UserVisitRepository,
    // UserPushTokenRepository,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
