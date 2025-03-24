import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Put, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { ResConfig } from '../../config';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get()
  // async getUsers(@Query('pageParam', ParseIntPipe) pageParam: number, @Res() res: Response) {
  //   const ret = await this.userService.getUsers({ pageParam });
  //
  //   return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  // }
  //
  // @Get(':userSeq')
  // async getUser(@Param('userSeq', ParseIntPipe) userSeq: number, @Res() res: Response) {
  //   const ret = await this.userService.getUser(userSeq);
  //
  //   return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  // }
  //
  // @Put(':userSeq')
  // async updateUser(@Param('userSeq', ParseIntPipe) userSeq: number, @Res() res: Response) {
  //   await this.userService.updateUser(userSeq);
  //
  //   return ResConfig.Success({ res, statusCode: 'OK' });
  // }
  //
  // @Patch(':userSeq/pause')
  // async pauseUser(@Param('userSeq', ParseIntPipe) userSeq: number, @Res() res: Response) {
  //   await this.userService.pauseUser(userSeq);
  //
  //   return ResConfig.Success({ res, statusCode: 'OK' });
  // }
  //
  // @Delete(':userSeq')
  // async deleteUser(@Param('userSeq', ParseIntPipe) userSeq: number, @Res() res: Response) {
  //   await this.userService.deleteUser(userSeq);
  //
  //   return ResConfig.Success({ res, statusCode: 'OK' });
  // }
}
