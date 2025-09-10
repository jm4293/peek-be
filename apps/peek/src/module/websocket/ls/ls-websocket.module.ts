import { Module } from '@nestjs/common';

import { StockKoreanIndexHistoryRepository } from '@database/repositories/stock';
import { TokenRepository } from '@database/repositories/token';

import { LsKoreanIndexGateway } from './ls-korean-index.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [LsKoreanIndexGateway, TokenRepository, StockKoreanIndexHistoryRepository],
  exports: [],
})
export class LsWebSocketModule {}
