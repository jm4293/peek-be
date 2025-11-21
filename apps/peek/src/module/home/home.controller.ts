import { Controller, Get } from '@nestjs/common';

import { Public } from '@peek/decorator/public';

import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('recent-boards')
  async getRecentBoards() {
    const ret = await this.homeService.getRecentBoards();

    // return ResConfig.Success({ res, statusCode: 'OK', data: ret });
    return {};
  }
}
