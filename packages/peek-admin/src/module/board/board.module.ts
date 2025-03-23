import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardRepository } from '../../database/response';

@Module({
  imports: [],
  controllers: [BoardController],
  providers: [BoardService, BoardRepository],
  exports: [],
})
export class BoardModule {}
