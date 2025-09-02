import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationHandler } from '@peek/handler/notification';

import { UserNotification } from '@database/entities/user';
import {
  BoardArticleRepository,
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
} from '@database/repositories/board';
import { StockCategoryRepository } from '@database/repositories/stock';
import { UserAccountRepository, UserPushTokenRepository, UserRepository } from '@database/repositories/user';

import { BoardController } from './board.controller';
import { BoardService } from './board.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotification])],
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
    UserPushTokenRepository,

    NotificationHandler,
  ],
  exports: [],
})
export class BoardModule {}
