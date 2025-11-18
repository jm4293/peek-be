import { Module } from '@nestjs/common';

import { StockCategoryRepository, StockCompanyRepository } from '@libs/database/repositories/stock';

import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [],
  controllers: [StockController],
  providers: [StockService, StockCompanyRepository, StockCategoryRepository],
  exports: [],
})
export class StockModule {}
