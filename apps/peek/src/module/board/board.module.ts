import { Module } from '@nestjs/common';

import {
  BoardArticleRepository,
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
  StockCategoryRepository,
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
    BoardCommentRepository,
    BoardLikeRepository,

    StockCategoryRepository,

    UserRepository,
    UserAccountRepository,
  ],
  exports: [],
})
export class BoardModule {}
