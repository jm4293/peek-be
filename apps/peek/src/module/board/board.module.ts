import { Module } from '@nestjs/common';

import {
  BoardArticleRepository,
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
} from '@database/repositories/board';
import { StockCategoryRepository } from '@database/repositories/stock';
import { UserAccountRepository, UserRepository } from '@database/repositories/user';

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
