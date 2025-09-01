import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { TokenRepository } from '@database/repositories/token';

import { KiwoomTokenScheduleService } from './kiwoom-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [KiwoomTokenScheduleService, TokenRepository],
  exports: [],
})
export class KiwoomScheduleModule {}
