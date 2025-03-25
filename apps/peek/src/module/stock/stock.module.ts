import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import {
  KOSDAQCodeRepository,
  KOSPICodeRepository,
  KisTokenIssueRepository,
  KisTokenRepository,
  UserRepository,
} from '@libs/database/repositories';

import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [HttpModule],
  controllers: [StockController],
  providers: [
    StockService,

    KOSPICodeRepository,
    KOSDAQCodeRepository,
    KisTokenRepository,
    KisTokenIssueRepository,
    UserRepository,
  ],
  exports: [],
})
export class StockModule {}
