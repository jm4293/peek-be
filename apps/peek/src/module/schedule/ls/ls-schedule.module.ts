import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SecuritiesTokenRepository } from '@database/repositories/stock';

import { LsTokenScheduleService } from './ls-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [LsTokenScheduleService, SecuritiesTokenRepository],
  exports: [],
})
export class LsScheduleModule {}
