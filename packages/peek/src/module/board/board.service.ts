import { Injectable } from '@nestjs/common';
import {
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
  UserPushTokenRepository,
  UserRepository,
} from '../../database/repository';
import { ResConfig } from '../../config';
import { CreateBoardCommentDto, CreateBoardDto, UpdateBoardCommentDto, UpdateBoardDto } from '../../type/dto';
import { Request } from 'express';
import { SelectQueryBuilder } from 'typeorm';
import { Board, BoardComment } from '../../database/entities';
import { NotificationHandler } from '../../handler';
import { UserNotificationTypeEnum } from '../../constant/enum';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly boardCommentRepository: BoardCommentRepository,
    private readonly boardLikeRepository: BoardLikeRepository,
    private readonly userRepository: UserRepository,
    private readonly userPushTokenRepository: UserPushTokenRepository,

    private readonly notificationHandler: NotificationHandler,
  ) {}

  // 게시판
  async getBoardList(params: { pageParam: number }) {
    const { pageParam } = params;

    const LIMIT = 1;

    const queryBuilder: SelectQueryBuilder<Board> = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'user')
      .loadRelationCountAndMap('board.likeCount', 'board.boardLikes')
      .loadRelationCountAndMap('board.commentCount', 'board.boardComments', 'boardComments', (qb) =>
        qb.andWhere('boardComments.isDeleted = :isDeleted', { isDeleted: false }),
      )
      .where('board.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('board.createdAt', 'DESC')
      .skip((pageParam - 1) * LIMIT)
      .take(LIMIT);

    const [boards, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = pageParam * LIMIT < total;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    return { boards, total, nextPage };
  }

  async getMyBoardList(params: { pageParam: number; req: Request }) {
    const { pageParam, req } = params;
    const { userSeq } = req.user;

    const LIMIT = 10;

    const queryBuilder: SelectQueryBuilder<Board> = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'user')
      .loadRelationCountAndMap('board.commentCount', 'board.boardComments', 'boardComments', (qb) =>
        qb.andWhere('boardComments.isDeleted = :isDeleted', { isDeleted: false }),
      )
      .where('board.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('user.userSeq = :userSeq', { userSeq })
      .orderBy('board.createdAt', 'DESC')
      .skip((pageParam - 1) * LIMIT)
      .take(LIMIT);

    const [boards, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = pageParam * LIMIT < total;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    return { boards, total, nextPage };
  }

  async getBoardDetail(params: { boardSeq: number; req: Request }) {
    const { boardSeq, req } = params;
    const { user } = req;

    const board = await this.boardRepository.findBoardByBoardSeq(boardSeq);

    await this.boardRepository.increaseBoardViewCount(boardSeq);

    const isMine = board.user.userSeq === user?.userSeq;

    return { board, isMine };
  }

  async createBoard(params: { dto: CreateBoardDto; req: Request }) {
    const { dto, req } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const board = this.boardRepository.create({ ...dto, user });

    await this.boardRepository.save(board);
  }

  async updateBoard(params: { boardSeq: number; dto: UpdateBoardDto; req: Request }) {
    const { boardSeq, dto, req } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const board = await this.boardRepository.findBoardByBoardSeq(boardSeq);

    if (board.user.userSeq !== user.userSeq) {
      throw ResConfig.Fail_400({ message: '게시물 작성자만 수정할 수 있습니다.' });
    }

    await this.boardRepository.update({ boardSeq }, dto);
  }

  async deleteBoard(params: { boardSeq: number; req: Request }) {
    const { boardSeq, req } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const board = await this.boardRepository.findBoardByBoardSeq(boardSeq);

    if (board.user.userSeq !== user.userSeq) {
      throw ResConfig.Fail_400({ message: '게시물 작성자만 삭제할 수 있습니다.' });
    }

    await this.boardRepository.update({ boardSeq }, { isDeleted: true, deletedAt: new Date() });
  }

  // 게시판 댓글
  async getBoardCommentList(params: { boardSeq: number; pageParam: number; req: Request }) {
    const { boardSeq, pageParam, req } = params;
    const { user } = req;

    await this.boardRepository.findBoardByBoardSeq(boardSeq);

    const LIMIT = 1;

    const [boardComments, total] = await this.boardCommentRepository.findAndCount({
      where: { board: { boardSeq }, isDeleted: false },
      order: { createdAt: 'ASC' },
      skip: (pageParam - 1) * LIMIT,
      take: LIMIT,
      relations: ['user'],
    });

    const isMineBoardComments = boardComments.map((boardComment) => {
      const isMine = boardComment.user.userSeq === user?.userSeq;

      return { ...boardComment, isMine };
    });

    const hasNextPage = pageParam * LIMIT < total;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    return { boardComments: isMineBoardComments, total, nextPage };
  }

  async getMyBoardCommentList(params: { pageParam: number; req: Request }) {
    const { pageParam, req } = params;
    const { userSeq } = req.user;

    const LIMIT = 10;

    const queryBuilder: SelectQueryBuilder<BoardComment> = this.boardCommentRepository
      .createQueryBuilder('boardComment')
      .leftJoinAndSelect('boardComment.board', 'board')
      .leftJoinAndSelect('boardComment.user', 'user')
      .where('boardComment.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('user.userSeq = :userSeq', { userSeq })
      .orderBy('boardComment.createdAt', 'DESC')
      .skip((pageParam - 1) * LIMIT)
      .take(LIMIT);

    const [boardComments, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = pageParam * LIMIT < total;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    return { boardComments, total, nextPage };
  }

  async createBoardComment(params: { boardSeq: number; dto: CreateBoardCommentDto; req: Request }) {
    const { boardSeq, dto, req } = params;
    const { userSeq } = req.user;
    const { content } = dto;

    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const board = await this.boardRepository.findBoardByBoardSeq(boardSeq);

    const boardComment = this.boardCommentRepository.create({ content, user, board });

    await this.boardCommentRepository.save(boardComment);

    // if (board.user.userSeq !== user.userSeq) {
    //   const userPushToken = await this.userPushTokenRepository.getUserPushTokenByUserSeq(board.user.userSeq);
    //
    //   await this.notificationHandler.sendPushNotification({
    //     pushToken: String(userPushToken.pushToken),
    //     message: `${user.nickname}님이 ${board.title} 게시물에 댓글을 달았습니다.`,
    //     userNotificationType: UserNotificationTypeEnum.BOARD_COMMENT,
    //     userSeq: board.user.userSeq,
    //   });
    // }
  }

  async updateBoardComment(params: {
    boardSeq: number;
    boardCommentSeq: number;
    dto: UpdateBoardCommentDto;
    req: Request;
  }) {
    const { boardSeq, boardCommentSeq, dto, req } = params;
    const { userSeq } = req.user;
    const { content } = dto;

    await this.boardRepository.findBoardByBoardSeq(boardSeq);
    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const boardComment = await this.boardCommentRepository.findBoardCommentByBoardCommentSeq(boardCommentSeq);

    if (boardComment.user.userSeq !== user.userSeq) {
      throw ResConfig.Fail_400({ message: '댓글 작성자만 수정할 수 있습니다.' });
    }

    await this.boardCommentRepository.update({ boardCommentSeq }, { content });
  }

  async deleteBoardComment(params: { boardSeq: number; boardCommentSeq: number; req: Request }) {
    const { boardSeq, boardCommentSeq, req } = params;
    const { userSeq } = req.user;

    await this.boardRepository.findBoardByBoardSeq(boardSeq);
    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const boardComment = await this.boardCommentRepository.findBoardCommentByBoardCommentSeq(boardCommentSeq);

    if (boardComment.user.userSeq !== user.userSeq) {
      throw ResConfig.Fail_400({ message: '댓글 작성자만 삭제할 수 있습니다.' });
    }

    await this.boardCommentRepository.update({ boardCommentSeq }, { isDeleted: true, deletedAt: new Date() });
  }

  // 게시판 좋아요(찜)
  async boardLike(params: { boardSeq: number; req: Request }) {
    const { boardSeq, req } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);
    const board = await this.boardRepository.findBoardByBoardSeq(boardSeq);

    const boardLike = await this.boardLikeRepository.findOne({
      where: { boardSeq: board.boardSeq, userSeq: user.userSeq },
    });

    if (boardLike) {
      await this.boardLikeRepository.delete({ board, user });
    } else {
      const newBoardLike = this.boardLikeRepository.create({ board, user });

      await this.boardLikeRepository.save(newBoardLike);
    }
  }
}
