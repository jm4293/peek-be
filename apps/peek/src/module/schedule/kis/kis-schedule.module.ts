import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SecuritiesTokenRepository } from '@database/repositories/stock';

import { KisTokenScheduleService } from './kis-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [KisTokenScheduleService, SecuritiesTokenRepository],
  exports: [],
})
export class KisScheduleModule {}
