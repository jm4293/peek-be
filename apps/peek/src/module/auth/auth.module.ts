import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { jwtModuleConfig } from '@peek/config/jwt';

import {
  UserAccountRepository,
  UserOauthTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@libs/database/repositories/user';

import { AWSService } from '../aws';
import { EmailVerificationService } from '../email-verification';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.registerAsync(jwtModuleConfig), HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AWSService,
    EmailVerificationService,

    UserRepository,
    UserAccountRepository,
    UserVisitRepository,
    // UserPushTokenRepository,
    UserOauthTokenRepository,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
