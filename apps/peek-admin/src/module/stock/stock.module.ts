import { Module } from '@nestjs/common';

import { BoardCategoryRepository, StockCompanyRepository } from '@libs/database/repositories';

import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [],
  controllers: [StockController],
  providers: [StockService, StockCompanyRepository, BoardCategoryRepository],
  exports: [],
})
export class StockModule {}
