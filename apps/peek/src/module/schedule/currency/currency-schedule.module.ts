import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CurrencyHistoryRepository } from '@database/repositories/currency';

import { CurrencyService } from './currency.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [CurrencyService, CurrencyHistoryRepository],
  exports: [],
})
export class CurrencyScheduleModule {}
