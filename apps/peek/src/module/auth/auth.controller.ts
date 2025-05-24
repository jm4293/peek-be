import { Request, Response } from 'express';

import { Body, Controller, Post, Req, Res } from '@nestjs/common';

import { REFRESH_TOKEN_COOKIE_TIME } from '@libs/constant';

import { ResConfig } from '../../config';
import { Public } from '../../decorator';
import { CheckEmailDto, CreateUserEmailDto, LoginEmailDto, LoginOauthDto } from '../../type/dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginEmailDto, @Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login({ dto, req });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_COOKIE_TIME,
    });

    return ResConfig.Success({ res, statusCode: 'OK', data: { accessToken } });
  }

  @Public()
  @Post('login-oauth')
  async loginOauth(@Body() dto: LoginOauthDto, @Req() req: Request, @Res() res: Response) {
    const ret = await this.authService.loginOauth({ dto, req });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Public()
  @Post('check-email')
  async checkEmail(@Body() dto: CheckEmailDto, @Res() res: Response) {
    const ret = await this.authService.checkEmail(dto);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Public()
  @Post('register')
  async register(@Body() dto: CreateUserEmailDto, @Res() res: Response) {
    const ret = await this.authService.registerEmail(dto);

    return ResConfig.Success({ res, statusCode: 'CREATED', data: ret });
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const { accessToken } = await this.authService.refreshToken({ req });

    return ResConfig.Success({ res, statusCode: 'OK', data: { accessToken } });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.logout({ req });

    const cookies = req.cookies;

    for (const cookie in cookies) {
      if (cookies.hasOwnProperty(cookie)) {
        res.clearCookie(cookie);
      }
    }

    return ResConfig.Success({ res, statusCode: 'OK', message: '로그아웃 되었습니다.' });
  }
}
