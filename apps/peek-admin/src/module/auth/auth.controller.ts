import { Request, Response } from 'express';

import { Body, Controller, Post, Req, Res } from '@nestjs/common';

import {
  ADMIN_ACCESS_TOKEN_COOKIE_TIME,
  ADMIN_ACCESS_TOKEN_NAME,
  ADMIN_REFRESH_TOKEN_COOKIE_TIME,
  ADMIN_REFRESH_TOKEN_NAME,
} from '@peek-admin/shared/cookie';
import { LoginDto } from '@peek-admin/type/dto';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login({ dto, req });

    res.cookie(ADMIN_ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_ACCESS_TOKEN_COOKIE_TIME,
    });

    res.cookie(ADMIN_REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_REFRESH_TOKEN_COOKIE_TIME,
    });

    res.status(200).json({ accessToken });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const { accountId } = req.userAccount;

    await this.authService.logout({ req, accountId });

    const cookies = req.cookies;

    for (const cookie in cookies) {
      if (cookies.hasOwnProperty(cookie)) {
        res.clearCookie(cookie);
      }
    }

    return res.status(200).json();
  }
}
