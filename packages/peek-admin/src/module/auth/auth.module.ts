import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAccountRepository } from '../../database/response';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UserAccountRepository],
  exports: [],
})
export class AuthModule {}
