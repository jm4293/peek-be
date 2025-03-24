import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { KisTokenRepository } from '@libs/database/repositories';

import { KisTokenScheduleService } from './kis-token-schedule.service';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [KisTokenScheduleService, KisTokenRepository],
  exports: [],
})
export class KisTokenScheduleModule {}
