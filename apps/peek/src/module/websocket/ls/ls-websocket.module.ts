import { Module } from '@nestjs/common';

import { SecuritiesTokenRepository, StockKoreanIndexHistoryRepository } from '@database/repositories/stock';

import { LsKoreanIndexGateway } from './ls-korean-index.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [LsKoreanIndexGateway, SecuritiesTokenRepository, StockKoreanIndexHistoryRepository],
  exports: [LsKoreanIndexGateway],
})
export class LsWebSocketModule {}
