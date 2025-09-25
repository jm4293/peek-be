import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { StockTokenRepository } from '@database/repositories/stock';

import { LsTokenScheduleService } from './ls-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [LsTokenScheduleService, StockTokenRepository],
  exports: [],
})
export class LsScheduleModule {}
