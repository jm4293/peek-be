import { BoardArticleRepository, BoardCommentRepository } from '@libs/database';

import { Module } from '@nestjs/common';

import { BoardRepository } from '@libs/database/repositories';

import { BoardController } from './board.controller';
import { BoardService } from './board.service';

@Module({
  imports: [],
  controllers: [BoardController],
  providers: [BoardService, BoardRepository, BoardArticleRepository, BoardCommentRepository],
  exports: [],
})
export class BoardModule {}
