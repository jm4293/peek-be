import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { StockKoreanIndexHistoryRepository } from '@database/repositories/stock';
import { TokenRepository } from '@database/repositories/token';

import { LsKoreanIndexGateway } from '../../websocket/ls/ls-korean-index.gateway';
import { LsTokenScheduleService } from './ls-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [LsTokenScheduleService, TokenRepository, StockKoreanIndexHistoryRepository, LsKoreanIndexGateway],
  exports: [],
})
export class LsScheduleModule {}
