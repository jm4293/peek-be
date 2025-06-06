import { Request, Response } from 'express';

import { Body, Controller, Post, Req, Res } from '@nestjs/common';

import { LoginDto } from '../../type/dto/auth';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
    return await this.authService.login({ dto, res });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    return await this.authService.logout({ req, res });
  }
}
