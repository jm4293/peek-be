import { Module } from '@nestjs/common';

import { SecuritiesTokenRepository, StockKoreanIndexHistoryRepository } from '@libs/database/repositories/stock';

import { KisKoreanIndexGateway } from './kis-korean-index.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [KisKoreanIndexGateway, SecuritiesTokenRepository, StockKoreanIndexHistoryRepository],
  exports: [KisKoreanIndexGateway],
})
export class KisWebSocketModule {}
