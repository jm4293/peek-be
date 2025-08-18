import { Request, Response } from 'express';

import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';

import { ACCESS_TOKEN_NAME } from '@peek/constant/cookie';
import { Public } from '@peek/decorator/public';

import { ACCESS_TOKEN_COOKIE_TIME } from '@constant/jwt';

import { AuthService } from './auth.service';
import { CheckEmailCodeDto, CheckEmailDto, LoginEmailDto, LoginOauthDto, SignupEmailDto } from './dto';

@Controller('auth')
export class AuthController {
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
    const cookieOptions = this._cookieOptions();

    const { accessToken, refreshToken } = await this.authService.login({ dto, req });

    // res.cookie(ACCESS_TOKEN_NAME, accessToken, {
    //   ...cookieOptions,
    //   maxAge: ACCESS_TOKEN_COOKIE_TIME,
    // });

    // res.cookie(REFRESH_TOKEN_NAME, refreshToken, {
    //   ...cookieOptions,
    //   maxAge: REFRESH_TOKEN_COOKIE_TIME,
    // });

    res.status(200).json({ accessToken, refreshToken });
  }

  @Public()
  @Post('login/oauth')
  async loginOauth(@Body() dto: LoginOauthDto, @Req() req: Request, @Res() res: Response) {
    const cookieOptions = this._cookieOptions();

    const { accessToken, refreshToken } = await this.authService.loginOauth({ dto, req });

    // res.cookie(ACCESS_TOKEN_NAME, accessToken, {
    //   ...cookieOptions,
    //   maxAge: ACCESS_TOKEN_COOKIE_TIME,
    // });

    // res.cookie('__rt', refreshToken, {
    //   ...cookieOptions,
    //   maxAge: REFRESH_TOKEN_COOKIE_TIME,
    // });

    res.status(200).json({ accessToken, refreshToken });
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    try {
      const cookieOptions = this._cookieOptions();

      const { accessToken } = await this.authService.refreshToken({ req });

      res.cookie(ACCESS_TOKEN_NAME, accessToken, {
        ...cookieOptions,
        maxAge: ACCESS_TOKEN_COOKIE_TIME,
      });

      res.status(200).json({ accessToken });
    } catch (err) {
      const cookies = req.cookies;

      for (const cookie in cookies) {
        if (cookies.hasOwnProperty(cookie)) {
          res.clearCookie(cookie);
        }
      }

      res.status(200).json({});
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.logout({ req });

    // const cookies = req.cookies;

    // for (const cookie in cookies) {
    //   if (cookies.hasOwnProperty(cookie)) {
    //     res.clearCookie(cookie);
    //   }
    // }

    res.status(200).json({});
  }

  private _cookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as 'lax' | 'strict' | 'none',
    };
  }
}
