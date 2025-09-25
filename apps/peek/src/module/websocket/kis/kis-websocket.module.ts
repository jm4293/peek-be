import { Module } from '@nestjs/common';

import { StockKoreanIndexHistoryRepository, StockTokenRepository } from '@database/repositories/stock';

import { KisKoreanIndexGateway } from './kis-korean-index.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [KisKoreanIndexGateway, StockTokenRepository, StockKoreanIndexHistoryRepository],
  exports: [],
})
export class KisWebSocketModule {}
