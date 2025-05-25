import { Request, Response } from 'express';

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';

import { ResConfig } from '../../config';
import {
  ReadUserNotificationDto,
  RegisterUserPushTokenDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from '../../type/dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getMyInfo(@Req() req: Request, @Res() res: Response) {
    const ret = await this.userService.getMyInfo(req);

    return ResConfig.Success({
      res,
      statusCode: 'OK',
      data: {
        email: ret.email,
        name: ret.user.name,
        nickname: ret.user.nickname,
        thumbnail: ret.user.thumbnail,
      },
    });
  }

  // 유저 정보 수정
  @Put()
  async updateUser(@Body() dto: UpdateUserDto, @Req() req: Request, @Res() res: Response) {
    await this.userService.updateUser({ dto, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }

  // 유저 비밀번호 수정
  @Patch('password')
  async updatePassword(@Body() dto: UpdateUserPasswordDto, @Req() req: Request, @Res() res: Response) {
    await this.userService.updatePassword({ dto, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Post('push-token')
  async registerPushToken(@Body() dto: RegisterUserPushTokenDto, @Req() req: Request, @Res() res: Response) {
    // await this.userService.registerPushToken({ dto, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }

  // 알림
  @Get('notifications')
  async getNotificationList(
    @Query('pageParam', ParseIntPipe) pageParam: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // const ret = await this.userService.getNotificationList({ pageParam, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Post('notification/read')
  async readNotification(@Body() dto: ReadUserNotificationDto, @Req() req: Request, @Res() res: Response) {
    // await this.userService.readNotification({ dto, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Post('notification/read-all')
  async readAllNotification(@Req() req: Request, @Res() res: Response) {
    // await this.userService.readAllNotification(req);
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Delete('notification/:userNotificationSeq')
  async deleteNotification(
    @Param('userNotificationSeq', ParseIntPipe) userNotificationSeq: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // await this.userService.deleteNotification({ userNotificationSeq, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }
}
