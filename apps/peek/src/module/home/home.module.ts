import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { BoardRepository } from '@libs/database/repositories';

@Module({
  imports: [],
  controllers: [HomeController],
  providers: [HomeService, BoardRepository],
  exports: [],
})
export class HomeModule {}
