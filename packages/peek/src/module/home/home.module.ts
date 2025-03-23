import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { BoardRepository } from '../../database/repository';

@Module({
  imports: [],
  controllers: [HomeController],
  providers: [HomeService, BoardRepository],
  exports: [],
})
export class HomeModule {}
