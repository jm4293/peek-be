import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { jwtModuleConfig } from '@peek/config/jwt';

import { UserAccountRepository, UserRepository, UserVisitRepository } from '@database/repositories/user';

import { AWSService } from '../aws';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.registerAsync(jwtModuleConfig), HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AWSService,

    UserRepository,
    UserAccountRepository,
    UserVisitRepository,
    // UserPushTokenRepository,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
