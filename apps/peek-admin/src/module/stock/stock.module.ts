import { Module } from '@nestjs/common';

import { KOSDAQCodeRepository, KOSPICodeRepository } from '@libs/database/repositories';

import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [],
  controllers: [StockController],
  providers: [StockService, KOSPICodeRepository, KOSDAQCodeRepository],
  exports: [],
})
export class StockModule {}
