import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KisTokenScheduleService } from './kis-token-schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { KisTokenRepository } from '@libs/database/repositories';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [KisTokenScheduleService, KisTokenRepository],
  exports: [],
})
export class KisTokenScheduleModule {}
