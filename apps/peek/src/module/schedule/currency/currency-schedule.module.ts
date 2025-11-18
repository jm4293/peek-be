import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CurrencyHistoryRepository } from '@libs/database/repositories/currency';

import { CurrencyScheduleService } from './currency-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [CurrencyScheduleService, CurrencyHistoryRepository],
  exports: [],
})
export class CurrencyScheduleModule {}
