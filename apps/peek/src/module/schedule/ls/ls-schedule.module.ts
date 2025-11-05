import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { LsWebSocketModule } from '@peek/module/websocket';

import { SecuritiesTokenRepository } from '@database/repositories/stock';

import { LsTokenScheduleService } from './ls-token-schedule.service';

@Module({
  imports: [HttpModule, LsWebSocketModule],
  controllers: [],
  providers: [LsTokenScheduleService, SecuritiesTokenRepository],
  exports: [],
})
export class LsScheduleModule {}
