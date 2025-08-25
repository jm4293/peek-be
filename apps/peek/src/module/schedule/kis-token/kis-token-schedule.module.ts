import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { KisTokenRepository } from '@database/repositories/kis';

import { KisTokenScheduleService } from './kis-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [KisTokenScheduleService, KisTokenRepository],
  exports: [],
})
export class KisTokenScheduleModule {}
