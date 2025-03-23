import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KisTokenScheduleService } from './kis-token-schedule.service';
import { KisTokenRepository } from '../../../database/repository';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [KisTokenScheduleService, KisTokenRepository],
  exports: [],
})
export class KisTokenScheduleModule {}
