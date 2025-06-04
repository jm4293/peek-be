import { Module } from '@nestjs/common';

import {
  BoardArticleRepository,
  BoardCategoryRepository,
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
  UserAccountRepository,
  UserRepository,
} from '@libs/database/repositories';

import { BoardController } from './board.controller';
import { BoardService } from './board.service';

@Module({
  imports: [],
  controllers: [BoardController],
  providers: [
    BoardService,

    BoardRepository,
    BoardArticleRepository,
    BoardCategoryRepository,
    BoardCommentRepository,
    BoardLikeRepository,

    UserRepository,
    UserAccountRepository,
  ],
  exports: [],
})
export class BoardModule {}
