import { UserAccount } from '@libs/database';
import { Request } from 'express';

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
} from '@nestjs/common';

import { ParseReqHandler } from '../../handler';
import {
  ReadUserNotificationDto,
  RegisterUserPushTokenDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
  UpdateUserThumbnailDto,
} from './dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getMyInfo(@Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    const ret = await this.userService.getMyInfo(accountId);

    return {
      my: new UserAccount(ret),
    };
  }

  // 유저 정보 수정
  @Put()
  @HttpCode(200)
  async updateUser(@Body() dto: UpdateUserDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.userService.updateUser({ dto, accountId });
  }

  @Patch('thumbnail')
  @HttpCode(200)
  async updateThumbnail(@Body() dto: UpdateUserThumbnailDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.userService.updateThumbnail({ dto, accountId });
  }

  // 유저 비밀번호 수정
  @Patch('password')
  @HttpCode(200)
  async updatePassword(@Body() dto: UpdateUserPasswordDto, @Req() req: Request) {
    // await this.userService.updatePassword({ dto, req });
    //
    // return;
  }

  @Post('push-token')
  async registerPushToken(@Body() dto: RegisterUserPushTokenDto) {
    // await this.userService.registerPushToken({ dto, req });
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
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
