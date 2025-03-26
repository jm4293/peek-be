import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserAccountRepository } from '@libs/database/repositories';

import { jwtModuleConfig } from '../../../../peek/src/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.registerAsync(jwtModuleConfig)],
  controllers: [AuthController],
  providers: [AuthService, UserAccountRepository],
  exports: [],
})
export class AuthModule {}
