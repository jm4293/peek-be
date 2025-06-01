import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserNotification } from '@libs/database/entities';

import {
  BoardArticleRepository,
  BoardCategoryRepository,
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
  UserAccountRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '@libs/database/repositories';

import { NotificationHandler } from '../../handler';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

@Module({
  // imports: [TypeOrmModule.forFeature([UserNotification])],
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
    UserPushTokenRepository,
    UserNotificationRepository,

    // NotificationHandler,
  ],
  exports: [],
})
export class BoardModule {}
