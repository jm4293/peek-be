import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { ResConfig } from '../../config';
import { Public } from '../../decorator';
import { CheckEmailDto, CreateUserEmailDto, LoginEmailDto, LoginOauthDto } from '../../type/dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register-email')
  async register(@Body() dto: CreateUserEmailDto, @Res() res: Response) {
    const ret = await this.authService.registerEmail(dto);

    return ResConfig.Success({ res, statusCode: 'CREATED', data: ret });
  }

  @Public()
  @Post('check-email')
  async checkEmail(@Body() dto: CheckEmailDto, @Res() res: Response) {
    const ret = await this.authService.checkEmail(dto);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Public()
  @Post('login-email')
  async loginEmail(@Body() dto: LoginEmailDto, @Req() req: Request, @Res() res: Response) {
    const ret = await this.authService.loginEmail({ dto, req });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  // @Public()
  // @Post('login-oauth')
  // async loginOauth(@Body() dto: LoginOauthDto, @Req() req: Request, @Res() res: Response) {
  //   const ret = await this.authService.loginOauth({ dto, req });
  //
  //   return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  // }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    return await this.authService.logout({ req, res });
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return await this.authService.refreshToken({ req, res });
  }
}
