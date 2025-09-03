import { Module } from '@nestjs/common';

import { StockKoreanIndexRepository } from '@database/repositories/stock';
import { TokenRepository } from '@database/repositories/token';

import { LsKoreanIndexGateway } from './ls-korean-index.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [LsKoreanIndexGateway, TokenRepository, StockKoreanIndexRepository],
  exports: [],
})
export class LsWebSocketModule {}
