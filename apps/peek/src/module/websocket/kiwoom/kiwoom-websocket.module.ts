import { Module } from '@nestjs/common';

import { StockTokenRepository } from '@database/repositories/stock';

import { KiwoomKoreanStockGateway } from './kiwoom-korean-stock.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [KiwoomKoreanStockGateway, StockTokenRepository],
  exports: [],
})
export class KiwoomWebSocketModule {}
