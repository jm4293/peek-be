import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import {
  StockCategoryRepository,
  StockCompanyRepository,
  StockKoreanIndexHistoryRepository,
} from '@database/repositories/stock';
import { TokenRepository } from '@database/repositories/token';
import { UserAccountRepository, UserRepository } from '@database/repositories/user';

import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [HttpModule],
  controllers: [StockController],
  providers: [
    StockService,

    StockCategoryRepository,
    StockCompanyRepository,
    StockKoreanIndexHistoryRepository,

    TokenRepository,

    UserRepository,
    UserAccountRepository,
  ],
  exports: [],
})
export class StockModule {}
