import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { HttpModule } from '@nestjs/axios';
import { KisTokenIssueRepository, KisTokenRepository, UserRepository } from '@libs/database/repositories';

@Module({
  imports: [HttpModule],
  controllers: [StockController],
  providers: [StockService, KisTokenRepository, KisTokenIssueRepository, UserRepository],
  exports: [],
})
export class StockModule {}
