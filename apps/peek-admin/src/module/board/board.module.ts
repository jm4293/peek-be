import { Module } from '@nestjs/common';

import { BoardArticleRepository, BoardCommentRepository, BoardRepository } from '@libs/database/repositories/board';

import { BoardController } from './board.controller';
import { BoardService } from './board.service';

@Module({
  imports: [],
  controllers: [BoardController],
  providers: [BoardService, BoardRepository, BoardArticleRepository, BoardCommentRepository],
  exports: [],
})
export class BoardModule {}
