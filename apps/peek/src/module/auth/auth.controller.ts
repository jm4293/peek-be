import { CookieOptions, Request, Response } from 'express';

import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';

import { Public } from '@peek/decorator/public';
import { ParseReqHandler } from '@peek/handler/parseReq';
import {
  ACCESS_TOKEN_COOKIE_TIME,
  ACCESS_TOKEN_NAME,
  REFRESH_TOKEN_COOKIE_TIME,
  REFRESH_TOKEN_NAME,
} from '@peek/shared/constants/cookie';

import { AuthService } from './auth.service';
import { CheckEmailCodeDto, CheckEmailDto, LoginEmailDto, LoginOauthDto, SignupEmailDto } from './dto';

@Controller('auth')
export class AuthController {
  cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.peek.run' : 'localhost',
  };

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('check-email')
  @HttpCode(200)
  async checkEmail(@Body() dto: CheckEmailDto) {
    return await this.authService.checkEmail(dto);
  }

  @Public()
  @Post('check-email-code')
  @HttpCode(200)
  async checkEmailCode(@Body() dto: CheckEmailCodeDto) {
    return await this.authService.checkEmailCode(dto);
  }

  @Public()
  @Post('signup')
  async signup(@Body() dto: SignupEmailDto) {
    return await this.authService.signup(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginEmailDto, @Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login({ dto, req });

    res.cookie(ACCESS_TOKEN_NAME, accessToken, {
      ...this.cookieOptions,
      maxAge: ACCESS_TOKEN_COOKIE_TIME,
    });

    res.cookie(REFRESH_TOKEN_NAME, refreshToken, {
      ...this.cookieOptions,
      maxAge: REFRESH_TOKEN_COOKIE_TIME,
    });

    res.status(200).json({});
  }

  @Public()
  @Post('login/oauth')
  async loginOauth(@Body() dto: LoginOauthDto, @Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.loginOauth({ dto, req });

    res.cookie(ACCESS_TOKEN_NAME, accessToken, {
      ...this.cookieOptions,
      maxAge: ACCESS_TOKEN_COOKIE_TIME,
    });

    res.cookie(REFRESH_TOKEN_NAME, refreshToken, {
      ...this.cookieOptions,
      maxAge: REFRESH_TOKEN_COOKIE_TIME,
    });

    res.status(200).json({});
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.refreshToken({ req });

    if (!response) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.cookie(ACCESS_TOKEN_NAME, response, {
      ...this.cookieOptions,
      maxAge: ACCESS_TOKEN_COOKIE_TIME,
    });

    res.status(200).json({ tkn: response });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.authService.logout({ req, accountId });

    const cookies = req.cookies;

    for (const cookie in cookies) {
      if (cookies.hasOwnProperty(cookie)) {
        res.clearCookie(cookie, {
          domain: process.env.NODE_ENV === 'production' ? '.peek.run' : 'localhost',
          path: '/',
          secure: process.env.NODE_ENV === 'production' ? true : false,
          sameSite: 'lax',
        });
      }
    }

    res.status(200).json({});
  }
}
