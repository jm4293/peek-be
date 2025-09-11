import { Module } from '@nestjs/common';

import { TokenRepository } from '@database/repositories/token';

import { KiwoomKoreanStockGateway } from './kiwoom-korean-stock.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [KiwoomKoreanStockGateway, TokenRepository],
  exports: [],
})
export class KiwoomWebSocketModule {}
