import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { ResConfig } from '../../config';
import { Public } from '../../decorator';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly kisService: StockService) {}

  // 토큰
  @Get('oauth-token')
  async getOuathToken(@Req() req: Request, @Res() res: Response) {
    const ret = await this.kisService.getOuathToken({ req });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  // 종목 코드 조회
  @Public()
  @Get('code-list')
  async getCodeList(@Res() res: Response) {
    const ret = await this.kisService.getCodeList();

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  // 종목 상세 조회
  @Public()
  @Get('code-detail')
  async getCodeDetail(@Query('code') code: string, @Res() res: Response) {
    const ret = await this.kisService.getCodeDetail({ code });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }
}
