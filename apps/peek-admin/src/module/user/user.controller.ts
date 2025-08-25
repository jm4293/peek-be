import { Response } from 'express';

import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Put, Query, Res } from '@nestjs/common';

import { ResConfig } from '@peek-admin/config/_res.config';
import { GetUserDto, GetUserListDto } from '@peek-admin/type/dto';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async getUser(@Param() param: GetUserDto) {
    const { userId } = param;

    const ret = await this.userService.getUser(userId);

    // return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Get()
  async getUserList(@Query() query: GetUserListDto) {
    const [users, total] = await this.userService.getUserList(query);

    return {
      userList: users,
      total,
    };
  }

  @Put(':userSeq')
  async updateUser(@Param('userSeq', ParseIntPipe) userSeq: number, @Res() res: Response) {
    // await this.userService.updateUser(userSeq);
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Patch(':userSeq/pause')
  async pauseUser(@Param('userSeq', ParseIntPipe) userSeq: number, @Res() res: Response) {
    // await this.userService.pauseUser(userSeq);
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Delete(':userSeq')
  async deleteUser(@Param('userSeq', ParseIntPipe) userSeq: number, @Res() res: Response) {
    // await this.userService.deleteUser(userSeq);
    //
    // return ResConfig.Success({ res, statusCode: 'OK' });
  }
}
