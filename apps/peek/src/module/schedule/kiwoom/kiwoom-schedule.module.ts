import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { StockTokenRepository } from '@database/repositories/stock';

import { KiwoomTokenScheduleService } from './kiwoom-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [KiwoomTokenScheduleService, StockTokenRepository],
  exports: [],
})
export class KiwoomScheduleModule {}
