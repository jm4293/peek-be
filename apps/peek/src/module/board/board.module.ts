import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserNotification } from '@libs/database/entities';
import {
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '@libs/database/repositories';

import { NotificationHandler } from '../../handler';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotification])],
  controllers: [BoardController],
  providers: [
    BoardService,

    BoardRepository,
    BoardCommentRepository,
    BoardLikeRepository,
    UserRepository,
    UserPushTokenRepository,
    UserNotificationRepository,

    NotificationHandler,
  ],
  exports: [],
})
export class BoardModule {}
