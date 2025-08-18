import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { jwtModuleConfig } from '@peek/config/jwt';

import { UserAccountRepository, UserRepository, UserVisitRepository } from '@database/repositories/user';

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
  ],
  exports: [JwtModule],
})
export class AuthModule {}
