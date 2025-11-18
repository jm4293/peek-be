import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { LsWebSocketModule } from '@peek/module/websocket';

import { SecuritiesTokenRepository } from '@libs/database/repositories/stock';

import { LsScheduleService } from './ls-schedule.service';

@Module({
  imports: [HttpModule, LsWebSocketModule],
  controllers: [],
  providers: [LsScheduleService, SecuritiesTokenRepository],
  exports: [],
})
export class LsScheduleModule {}
