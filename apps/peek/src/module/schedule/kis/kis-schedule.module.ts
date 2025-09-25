import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { StockTokenRepository } from '@database/repositories/stock';

import { KisTokenScheduleService } from './kis-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [KisTokenScheduleService, StockTokenRepository],
  exports: [],
})
export class KisScheduleModule {}
