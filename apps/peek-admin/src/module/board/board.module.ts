import { Module } from '@nestjs/common';

import { BoardRepository } from '@libs/database/repositories';

import { BoardController } from './board.controller';
import { BoardService } from './board.service';

@Module({
  imports: [],
  controllers: [BoardController],
  providers: [BoardService, BoardRepository],
  exports: [],
})
export class BoardModule {}
