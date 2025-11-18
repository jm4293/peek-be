import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SecuritiesTokenRepository } from '@libs/database/repositories/stock';

import { KiwoomTokenScheduleService } from './kiwoom-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [KiwoomTokenScheduleService, SecuritiesTokenRepository],
  exports: [],
})
export class KiwoomScheduleModule {}
