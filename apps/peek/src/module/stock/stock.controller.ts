import { Request, Response } from 'express';

import { Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Query, Req, Res } from '@nestjs/common';

import { StockKindEnum } from '@libs/constant';

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
  @Get()
  async getCodeList(@Query('kind') kind: StockKindEnum, @Query('text') text: string, @Res() res: Response) {
    const ret = await this.kisService.getCodeList({ kind, text: text?.trim() });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  // 종목 상세 조회
  @Public()
  @Get(':code')
  async getCodeDetail(
    @Param('code', ParseIntPipe) code: number,
    @Query('kind', new ParseEnumPipe(StockKindEnum)) kind: StockKindEnum,
    @Res() res: Response,
  ) {
    const ret = await this.kisService.getCodeDetail({ code, kind });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }
}
