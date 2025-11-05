import { Module } from '@nestjs/common';

import { SecuritiesTokenRepository } from '@database/repositories/stock';

import { KiwoomKoreanStockGateway } from './kiwoom-korean-stock.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [KiwoomKoreanStockGateway, SecuritiesTokenRepository],
  exports: [],
})
export class KiwoomWebSocketModule {}
