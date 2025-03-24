import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtModuleConfig } from '../../config';
import { HttpModule } from '@nestjs/axios';
import {
  UserAccountRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '@libs/database/repositories';

@Module({
  imports: [JwtModule.registerAsync(jwtModuleConfig), HttpModule],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, UserAccountRepository, UserPushTokenRepository, UserVisitRepository],
  exports: [JwtModule],
})
export class AuthModule {}
