import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { KisWebSocketModule } from '@peek/module/websocket';

import { SecuritiesTokenRepository } from '@libs/database/repositories/stock';

import { KisTokenScheduleService } from './kis-token-schedule.service';

@Module({
  imports: [HttpModule, KisWebSocketModule],
  controllers: [],
  providers: [KisTokenScheduleService, SecuritiesTokenRepository],
  exports: [],
})
export class KisScheduleModule {}
