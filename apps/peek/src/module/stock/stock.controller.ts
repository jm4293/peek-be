import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { Public } from '@peek/decorator/public';

import { StockCategory } from '@database/entities/stock';

import { UserService } from '../user';
import { GetStockCandleDto, GetStockKoreanDto, GetStockKoreanListDto, GetStockKoreanRankDto } from './dto';
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

  // @Post('korean/favorite/:code')
  // async addFavoriteStock(
  //   @Param('code') code: string,
  //   @Query('order') order: number,
  //   @Query('topFixed') topFixed: boolean,
  //   @Req() req: Request,
  // ) {
  //   const { accountId } = ParseReqHandler.parseReq(req);

  //   await this.userService.addFavoriteStock({ accountId, code, order, topFixed });
  // }

  // @Get('korean/favorite')
  // async getFavoriteStockList(@Req() req: Request) {
  //   const { accountId } = ParseReqHandler.parseReq(req);

  //   const ret = await this.userService.getFavoriteStockList(accountId);

  //   return {
  //     favoriteStockList: ret,
  //   };
  // }

  // @Delete('korean/favorite/:code')
  // async deleteFavoriteStock(@Param('code') code: string, @Req() req: Request) {
  //   const { accountId } = ParseReqHandler.parseReq(req);

  //   await this.userService.deleteFavoriteStock({ accountId, code });
  // }
}
