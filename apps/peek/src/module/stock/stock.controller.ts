import { Controller, Get, Param, Query } from '@nestjs/common';

import { Public } from '@peek/decorator/public';

import { StockCategory } from '@database/entities/stock';

import { GetStockKoreanDto, GetStockKoreanListDto } from './dto';
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

  // 종목 상세 조회
  @Public()
  @Get('korean/:code')
  async getStockKorean(@Param() param: GetStockKoreanDto) {
    const { code } = param;

    const ret = await this.stockService.getStockKorean(code);

    return {
      stockKorean: ret,
    };
  }

  // 종목 코드 조회
  @Public()
  @Get('korean')
  async getStockKoreanList(@Query() query: GetStockKoreanListDto) {
    const { stockKoreanList, total, nextPage } = await this.stockService.getStockKoreanList(query);

    return {
      stockKoreanList,
      total,
      nextPage,
    };
  }
}
