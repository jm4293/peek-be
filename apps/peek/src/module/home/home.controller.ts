import { Response } from 'express';

import { Controller, Get, Res } from '@nestjs/common';

import { ResConfig } from '../../config';
import { Public } from '../../decorator';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('recent-boards')
  async getRecentBoards(@Res() res: Response) {
    const ret = await this.homeService.getRecentBoards();

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }
}
