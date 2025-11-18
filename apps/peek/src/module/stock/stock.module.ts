import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import {
  SecuritiesTokenRepository,
  StockCategoryRepository,
  StockCompanyRepository,
  StockKoreanIndexHistoryRepository,
} from '@libs/database/repositories/stock';
import { UserAccountRepository, UserRepository, UserStockFavoriteRepository } from '@libs/database/repositories/user';

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
    SecuritiesTokenRepository,

    UserStockFavoriteRepository,
  ],
  exports: [],
})
export class StockModule {}
