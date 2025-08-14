import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { KisTokenIssueRepository, KisTokenRepository } from '@database/repositories/kis';
import { StockCategoryRepository, StockCompanyRepository } from '@database/repositories/stock';
import { UserRepository } from '@database/repositories/user';

import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [HttpModule],
  controllers: [StockController],
  providers: [
    StockService,

    StockCategoryRepository,
    StockCompanyRepository,

    KisTokenRepository,
    KisTokenIssueRepository,

    UserRepository,
  ],
  exports: [],
})
export class StockModule {}
