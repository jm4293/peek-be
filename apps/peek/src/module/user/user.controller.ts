import { Request, Response } from 'express';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';

import { Public } from '@peek/decorator/public';
import { ParseReqHandler } from '@peek/handler/parseReq';

import { UserAccount } from '@libs/database/entities/user';

import { CheckEmailCodeDto, CheckEmailDto } from '../auth/dto';
import {
  ReadUserNotificationDto,
  RegisterUserPushTokenDto,
  ResetUserPasswordDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
  UpdateUserThumbnailDto,
} from './dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUserInfo(@Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    const ret = await this.userService.getUserInfo(accountId);

    return {
      userInfo: new UserAccount(ret),
    };
  }

  @Put()
  async updateUser(@Body() dto: UpdateUserDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.userService.updateUser({ dto, accountId });
  }

  @Patch('thumbnail')
  async updateThumbnail(@Body() dto: UpdateUserThumbnailDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.userService.updateThumbnail({ dto, accountId });
  }

  @Public()
  @Post('check-email')
  @HttpCode(200)
  async checkEmail(@Body() dto: CheckEmailDto) {
    return await this.userService.checkEmail(dto);
  }

  @Public()
  @Post('check-email-code')
  @HttpCode(200)
  async checkEmailCode(@Body() dto: CheckEmailCodeDto) {
    const { randomCode } = await this.userService.checkEmailCode(dto);

    return { success: true, code: randomCode };
  }

  @Public()
  @Patch('password/reset')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetUserPasswordDto) {
    await this.userService.resetPassword(dto);
  }

  @Patch('password')
  @HttpCode(200)
  async updatePassword(@Body() dto: UpdateUserPasswordDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.userService.updatePassword({ dto, accountId });
  }

  @Delete()
  async deleteUser(@Req() req: Request, @Res() res: Response) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.userService.deleteUser(accountId);

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

  @Post('push-token')
  async registerPushToken(@Body() dto: RegisterUserPushTokenDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);
    const { 'sec-ch-ua-platform': platform } = req.headers;

    await this.userService.registerPushToken({ dto, accountId, platform: String(platform) });
  }

  // 알림
  @Get('notifications')
  async getNotificationList(@Query('page', ParseIntPipe) page: number) {
    // const ret = await this.userService.getNotificationList({ page, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Post('notification/read')
  async readNotification(@Body() dto: ReadUserNotificationDto) {
    // await this.userService.readNotification({ dto, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Post('notification/read-all')
  async readAllNotification() {
    // await this.userService.readAllNotification(req);
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Delete('notification/:userNotificationSeq')
  async deleteNotification(@Param('userNotificationSeq', ParseIntPipe) userNotificationSeq: number) {
    // await this.userService.deleteNotification({ userNotificationSeq, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }
}
