import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import {
  StockCategoryRepository,
  StockCompanyRepository,
  StockKoreanIndexHistoryRepository,
  StockTokenRepository,
} from '@database/repositories/stock';
import { UserAccountRepository, UserRepository, UserStockFavoriteRepository } from '@database/repositories/user';

import { UserModule } from '../user';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [HttpModule, UserModule],
  controllers: [StockController],
  providers: [
    StockService,

    StockCategoryRepository,
    StockCompanyRepository,
    StockKoreanIndexHistoryRepository,
    StockTokenRepository,

    UserStockFavoriteRepository,
  ],
  exports: [],
})
export class StockModule {}
