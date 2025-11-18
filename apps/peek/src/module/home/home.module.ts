import { Module } from '@nestjs/common';

import { BoardRepository } from '@libs/database/repositories/board';

import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [],
  controllers: [HomeController],
  providers: [HomeService, BoardRepository],
  exports: [],
})
export class HomeModule {}
