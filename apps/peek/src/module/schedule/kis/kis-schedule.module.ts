import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { TokenRepository } from '@database/repositories/token';

import { KisTokenScheduleService } from './kis-token-schedule.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [KisTokenScheduleService, TokenRepository],
  exports: [],
})
export class KisScheduleModule {}
