import { Request, Response } from 'express';

import { Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Query, Req, Res } from '@nestjs/common';

import { Public } from '@peek/decorator/public';

import { StockCategoryEnum } from '@constant/enum/stock';

import { StockCategory } from '@database/entities/stock';

import { GetCodeKoreanListDto } from './dto';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Public()
  @Get('category')
  async getStockCategoryList() {
    const ret = await this.stockService.getStockCategoryList();

    return {
      stockCategoryList: ret.map((item) => new StockCategory(item)),
    };
  }

  // 토큰
  @Public()
  @Get('token')
  async getToken() {
    // const { token } = await this.stockService.getToken();
    // return { token };
  }

  // 종목 코드 조회
  @Public()
  @Get('code/korean')
  async getStockCodeKoreanList(@Query() query: GetCodeKoreanListDto) {
    const { stockCodeList, total, nextPage } = await this.stockService.getStockCodeKoreanList(query);

    return {
      stockCodeList,
      total,
      nextPage,
    };
  }

  // 종목 상세 조회
  @Public()
  @Get(':code')
  async getCodeDetail(
    @Param('code', ParseIntPipe) code: number,
    @Query('kind', new ParseEnumPipe(StockCategoryEnum)) kind: StockCategoryEnum,
    @Res() res: Response,
  ) {
    // const ret = await this.stockService.getCodeDetail({ code, kind });
    // return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }
}
