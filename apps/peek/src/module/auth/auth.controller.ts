import { Request, Response } from 'express';

import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';

import { REFRESH_TOKEN_COOKIE_TIME } from '@libs/constant';

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

    res.status(200).json({ accessToken });
  }

  @Public()
  @Post('login-oauth')
  async loginOauth(@Body() dto: LoginOauthDto) {
    // const ret = await this.authService.loginOauth({ dto, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Public()
  @Post('check-email')
  @HttpCode(200)
  async checkEmail(@Body() dto: CheckEmailDto) {
    // const ret = await this.authService.checkEmail(dto);
    //
    // return { ...ret };

    return await this.authService.checkEmail(dto);
  }

  @Public()
  @Post('register')
  async register(@Body() dto: CreateUserEmailDto) {
    // const ret = await this.authService.registerEmail(dto);
    //
    // return { ...ret };

    return await this.authService.registerEmail(dto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Req() req: Request) {
    const { accessToken } = await this.authService.refreshToken({ req });

    return { accessToken };
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

    return res.status(200).json();
  }
}
