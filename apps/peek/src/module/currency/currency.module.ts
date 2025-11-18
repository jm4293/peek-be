import { Module } from '@nestjs/common';

import { CurrencyHistoryRepository } from '@libs/database/repositories/currency';

import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';

@Module({
  imports: [],
  controllers: [CurrencyController],
  providers: [CurrencyService, CurrencyHistoryRepository],
  exports: [],
})
export class CurrencyModule {}
