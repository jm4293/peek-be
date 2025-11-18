import { Request } from 'express';

import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';

import { Public } from '@peek/decorator/public';
import { ParseReqHandler } from '@peek/handler/parseReq';

import { StockCategory } from '@libs/database/entities/stock';

import { UserService } from '../user';
import {
  GetStockCandleDto,
  GetStockFavoriteListDto,
  GetStockKoreanDto,
  GetStockKoreanListDto,
  GetStockKoreanRankDto,
  UpdateStockFavoriteDto,
} from './dto';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Get('category')
  async getStockCategoryList() {
    const ret = await this.stockService.getStockCategoryList();

    return {
      stockCategoryList: ret.map((item) => new StockCategory(item)),
    };
  }

  // 종목 코드 조회
  @Public()
  @Get('korean')
  async getStockKoreanList(@Query() query: GetStockKoreanListDto) {
    const { data, total, nextPage } = await this.stockService.getStockKoreanList(query);

    return {
      stockKoreanList: data,
      total,
      nextPage,
    };
  }

  // 종목 상세 조회
  @Public()
  @Get('korean/detail/:code')
  async getStockKorean(@Param() param: GetStockKoreanDto) {
    const { code } = param;

    const ret = await this.stockService.getStockKorean(code);

    return {
      stockKorean: ret,
    };
  }

  @Public()
  @Get('korean/rank')
  async getStockKoreanRank(@Query() query: GetStockKoreanRankDto) {
    const { data, total, nextPage } = await this.stockService.getStockKoreanRank(query);

    return {
      stockKoreanRankList: data,
      total,
      nextPage,
    };
  }

  @Public()
  @Get('korean/index/candle/:code')
  async getStockCandle(@Param('code') code: string, @Query() query: GetStockCandleDto) {
    const candleData = await this.stockService.getStockCandle(code, query);

    return {
      code,
      candleList: candleData,
      count: candleData.length,
    };
  }

  @Get('korean/favorite')
  async getFavoriteStockList(@Query() query: GetStockFavoriteListDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    const { data, nextPage, total } = await this.stockService.getFavoriteStockList(query, accountId);

    return {
      favoriteStockList: data,
      total,
      nextPage,
    };
  }

  @HttpCode(200)
  @Post('korean/favorite')
  async toggleFavoriteStock(@Body() body: UpdateStockFavoriteDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.stockService.toggleFavoriteStock({ body, accountId });
  }
}
