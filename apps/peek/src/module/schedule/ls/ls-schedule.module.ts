import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { TokenRepository } from '@database/repositories/token';

import { LsTokenScheduleService } from './ls-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [LsTokenScheduleService, TokenRepository, StockKoreanIndexHistoryRepository, LsKoreanIndexGateway],
  exports: [],
})
export class LsScheduleModule {}
