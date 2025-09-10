import { Module } from '@nestjs/common';

import { StockKoreanIndexHistoryRepository } from '@database/repositories/stock';
import { TokenRepository } from '@database/repositories/token';

import { KisKoreanIndexGateway } from './kis-korean-index.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [KisKoreanIndexGateway, TokenRepository, StockKoreanIndexHistoryRepository],
  exports: [],
})
export class KisWebSocketModule {}
