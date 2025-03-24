import { Controller, Get, Res } from '@nestjs/common';
import { HomeService } from './home.service';
import { Public } from '../../decorator';
import { ResConfig } from '../../config';
import { Response } from 'express';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  // @Public()
  // @Get('recent-boards')
  // async getRecentBoards(@Res() res: Response) {
  //   const ret = await this.homeService.getRecentBoards();
  //
  //   return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  // }
}
