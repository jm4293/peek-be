import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import {
  KisTokenIssueRepository,
  KisTokenRepository,
  StockCompanyRepository,
  UserRepository,
} from '@libs/database/repositories';

import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [HttpModule],
  controllers: [StockController],
  providers: [StockService, StockCompanyRepository, KisTokenRepository, KisTokenIssueRepository, UserRepository],
  exports: [],
})
export class StockModule {}
