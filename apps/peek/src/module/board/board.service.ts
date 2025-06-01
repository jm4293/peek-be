import { Request } from 'express';
import { DataSource } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { BoardTypeEnum } from '@libs/constant/enum/board';

import { Board, BoardArticle, BoardCategory, BoardComment, UserAccount } from '@libs/database/entities';

import {
  BoardArticleRepository,
  BoardCategoryRepository,
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
  UserAccountRepository,
  UserPushTokenRepository,
  UserRepository,
} from '@libs/database/repositories';

import { LIST_LIMIT } from '../../constant/list';
import {
  CreateBoardCommentDto,
  CreateBoardDto,
  GetBoardListDto,
  UpdateBoardCommentDto,
  UpdateBoardDto,
} from '../../type/dto';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly boardArticleRepository: BoardArticleRepository,
    private readonly boardCategoryRepository: BoardCategoryRepository,
    private readonly boardCommentRepository: BoardCommentRepository,
    private readonly boardLikeRepository: BoardLikeRepository,

    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userPushTokenRepository: UserPushTokenRepository,
    // private readonly notificationHandler: NotificationHandler,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // 게시판 카테고리
  async getBoardCategoryList() {
    return await this.boardCategoryRepository.find();
  }

  // 게시판
  async getBoardDetail(boardId: number) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId, deletedAt: null },
      relations: ['category', 'userAccount', 'userAccount.user', 'article'],
    });

    if (!board) {
      throw new BadRequestException('게시글을 찾을 수 없습니다.');
    }

    await this.boardRepository.increaseViewCount(boardId);

    return board;
  }

  async getBoardList(params: GetBoardListDto) {
    const { pageParam, category } = params;

    const queryBuilder = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.category', 'category')
      .leftJoinAndSelect('board.userAccount', 'userAccount')
      .leftJoinAndSelect('userAccount.user', 'user')
      .loadRelationCountAndMap('board.commentCount', 'board.comments')
      .loadRelationCountAndMap('board.likeCount', 'board.likes')
      .where('board.deletedAt IS NULL')
      .orderBy('board.createdAt', 'DESC')
      .skip((pageParam - 1) * LIST_LIMIT)
      .take(LIST_LIMIT);

    // if (category) {
    //   queryBuilder.andWhere('board.category = :category', { category: StockCategoryEnum[category] });
    // }

    const [boards, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = pageParam * LIST_LIMIT < total;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    return { boards, total, nextPage };
  }

  async getMyBoardList(params: { pageParam: number; req: Request }) {
    // const { pageParam, req } = params;
    // const { userSeq } = req.user;
    //
    // const LIMIT = 10;
    //
    // const queryBuilder: SelectQueryBuilder<Board> = this.boardRepository
    //   .createQueryBuilder('board')
    //   .leftJoinAndSelect('board.user', 'user')
    //   .loadRelationCountAndMap('board.commentCount', 'board.boardComments', 'boardComments', (qb) =>
    //     qb.andWhere('boardComments.isDeleted = :isDeleted', { isDeleted: false }),
    //   )
    //   .where('board.isDeleted = :isDeleted', { isDeleted: false })
    //   .andWhere('user.userSeq = :userSeq', { userSeq })
    //   .orderBy('board.createdAt', 'DESC')
    //   .skip((pageParam - 1) * LIMIT)
    //   .take(LIMIT);
    //
    // const [boards, total] = await queryBuilder.getManyAndCount();
    //
    // const hasNextPage = pageParam * LIMIT < total;
    // const nextPage = hasNextPage ? pageParam + 1 : null;
    //
    // return { boards, total, nextPage };
  }

  async createBoard(params: { dto: CreateBoardDto; req: Request }) {
    const { dto, req } = params;
    const { categoryId, title, content } = dto;
    const { accountId } = req.userAccount;

    await this.userAccountRepository.findById(accountId);

    await this.boardCategoryRepository.findById(categoryId);

    await this.dataSource.transaction(async (manager) => {
      const board = manager.getRepository(Board).create({
        type: BoardTypeEnum.GENERAL,
        title,
        boardCategoryId: categoryId,
        userAccountId: accountId,
      });

      const savedBoard = await manager.getRepository(Board).save(board);

      const boardArticle = manager.getRepository(BoardArticle).create({
        content,
        boardId: savedBoard.id,
      });

      await manager.getRepository(BoardArticle).save(boardArticle);
    });
  }

  async updateBoard(params: { boardId: number; dto: UpdateBoardDto; req: Request }) {
    const { boardId, dto, req } = params;
    const { accountId } = req.userAccount;

    await this._checkBoard({ accountId, boardId });

    await this.dataSource.transaction(async (manager) => {
      const { title, content } = dto;

      await manager.getRepository(Board).update({ id: boardId }, { title });

      await manager.getRepository(BoardArticle).update({ boardId }, { content });
    });
  }

  async deleteBoard(params: { boardId: number; req: Request }) {
    const { boardId, req } = params;
    const { accountId } = req.userAccount;

    await this._checkBoard({ accountId, boardId });

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Board).update({ id: boardId }, { deletedAt: new Date() });

      await manager.getRepository(BoardArticle).update({ boardId }, { deletedAt: new Date() });
    });
  }

  async _checkBoard(params: { accountId: number; boardId: number }) {
    const { accountId, boardId } = params;

    await this.userAccountRepository.findById(accountId);

    const board = await this.boardRepository.findOne({
      where: { id: boardId, deletedAt: null },
      relations: ['userAccount'],
    });

    if (accountId !== board.userAccount.id) {
      throw new BadRequestException('게시물 작성자만 수정할 수 있습니다.');
    }

    await this.boardArticleRepository.findByBoardId(boardId);
  }

  // 게시판 댓글
  async getBoardCommentList(params: { boardSeq: number; pageParam: number; req: Request }) {
    // const { boardSeq, pageParam, req } = params;
    // const { user } = req;
    //
    // await this.boardRepository.findByBoardSeq(boardSeq);
    //
    // const LIMIT = 5;
    //
    // const queryBuilder = this.boardCommentRepository
    //   .createQueryBuilder('boardComment')
    //   .leftJoinAndSelect('boardComment.user', 'user')
    //   .leftJoinAndSelect('boardComment.boardCommentReplies', 'boardCommentReplies')
    //   .leftJoinAndSelect('boardCommentReplies.user', 'replyUser')
    //   .where('boardComment.boardSeq = :boardSeq', { boardSeq })
    //   .andWhere('boardComment.isDeleted = :isDeleted', { isDeleted: false })
    //   .orderBy('boardComment.createdAt', 'ASC')
    //   .skip((pageParam - 1) * LIMIT)
    //   .take(LIMIT);
    //
    // const [boardComments, total] = await queryBuilder.getManyAndCount();
    //
    // const checkedIsMine = boardComments.map((boardComment) => {
    //   const isMine = boardComment.user.userSeq === user?.userSeq;
    //
    //   const boardCommentReplies = boardComment.boardCommentReplies.map((boardCommentReply) => {
    //     const isMine = boardCommentReply.user.userSeq === user?.userSeq;
    //
    //     return { ...boardCommentReply, isMine };
    //   });
    //
    //   return { ...boardComment, isMine, boardCommentReplies };
    // });
    //
    // const hasNextPage = pageParam * LIMIT < total;
    // const nextPage = hasNextPage ? pageParam + 1 : null;
    //
    // return { boardComments: checkedIsMine, total, nextPage };
  }

  async getMyBoardCommentList(params: { pageParam: number; req: Request }) {
    // const { pageParam, req } = params;
    // const { userSeq } = req.user;
    //
    // const LIMIT = 10;
    //
    // const queryBuilder: SelectQueryBuilder<BoardComment> = this.boardCommentRepository
    //   .createQueryBuilder('boardComment')
    //   .leftJoinAndSelect('boardComment.board', 'board')
    //   .leftJoinAndSelect('boardComment.user', 'user')
    //   .where('boardComment.isDeleted = :isDeleted', { isDeleted: false })
    //   .andWhere('user.userSeq = :userSeq', { userSeq })
    //   .orderBy('boardComment.createdAt', 'DESC')
    //   .skip((pageParam - 1) * LIMIT)
    //   .take(LIMIT);
    //
    // const [boardComments, total] = await queryBuilder.getManyAndCount();
    //
    // const hasNextPage = pageParam * LIMIT < total;
    // const nextPage = hasNextPage ? pageParam + 1 : null;
    //
    // return { boardComments, total, nextPage };
  }

  async createBoardComment(params: { boardSeq: number; dto: CreateBoardCommentDto; req: Request }) {
    // const { boardSeq, dto, req } = params;
    // const { userSeq } = req.user;
    // const { content } = dto;
    //
    // const user = await this.userRepository.findByUserSeq(userSeq);
    // const board = await this.boardRepository.findByBoardSeq(boardSeq);
    //
    // const boardComment = this.boardCommentRepository.create({ content, user, board });
    //
    // await this.boardCommentRepository.save(boardComment);
    //
    // if (board.user.userSeq !== user.userSeq) {
    //   // const userPushToken = await this.userPushTokenRepository.getUserPushTokenByUserSeq(board.user.userSeq);
    //
    //   await this.notificationHandler.sendPushNotification({
    //     pushToken: null,
    //     message: `${user.nickname}님이 ${board.title} 게시물에 댓글을 하였습니다.`,
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
    // const { boardSeq, boardCommentSeq, dto, req } = params;
    // const { userSeq } = req.user;
    // const { content } = dto;
    //
    // await this.boardRepository.findByBoardSeq(boardSeq);
    // const user = await this.userRepository.findByUserSeq(userSeq);
    // const boardComment = await this.boardCommentRepository.findByBoardCommentSeq(boardCommentSeq);
    //
    // if (boardComment.user.userSeq !== user.userSeq) {
    //   throw new BadRequestException('댓글 작성자만 수정할 수 있습니다.');
    // }
    //
    // await this.boardCommentRepository.update({ boardCommentSeq }, { content });
  }

  async deleteBoardComment(params: { boardSeq: number; boardCommentSeq: number; req: Request }) {
    // const { boardSeq, boardCommentSeq, req } = params;
    // const { userSeq } = req.user;
    //
    // await this.boardRepository.findByBoardSeq(boardSeq);
    // const user = await this.userRepository.findByUserSeq(userSeq);
    // const boardComment = await this.boardCommentRepository.findByBoardCommentSeq(boardCommentSeq);
    //
    // if (boardComment.user.userSeq !== user.userSeq) {
    //   throw new BadRequestException('댓글 작성자만 삭제할 수 있습니다.');
    // }
    //
    // await this.boardCommentRepository.update({ boardCommentSeq }, { isDeleted: true, deletedAt: new Date() });
  }

  // 게시판 댓글 답장
  async createBoardCommentReply(params: { boardCommentSeq: number; dto: CreateBoardCommentDto; req: Request }) {
    // const { boardCommentSeq, dto, req } = params;
    // const { userSeq } = req.user;
    // const { content } = dto;
    //
    // const user = await this.userRepository.findByUserSeq(userSeq);
    //
    // const boardComment = await this.boardCommentRepository.findByBoardCommentSeq(boardCommentSeq);
    //
    // const boardCommentReply = this.boardCommentReplyRepository.create({ content, user, boardComment });
    //
    // await this.boardCommentReplyRepository.save(boardCommentReply);
    //
    // if (boardComment.user.userSeq !== user.userSeq) {
    //   // const userPushToken = await this.userPushTokenRepository.getUserPushTokenByUserSeq(parentBoardComment.user.userSeq);
    //
    //   await this.notificationHandler.sendPushNotification({
    //     pushToken: null,
    //     message: `${user.nickname}님이 ${boardComment.content} 댓글에 답장을 하였습니다.`,
    //     userNotificationType: UserNotificationTypeEnum.BOARD_COMMENT_REPLY,
    //     userSeq: boardComment.user.userSeq,
    //   });
    // }
  }

  async deleteBoardCommentReply(params: { boardCommentSeq: number; boardCommentReplySeq: number; req: Request }) {
    // const { boardCommentSeq, boardCommentReplySeq, req } = params;
    // const { userSeq } = req.user;
    //
    // const user = await this.userRepository.findByUserSeq(userSeq);
    //
    // await this.boardCommentRepository.findByBoardCommentSeq(boardCommentSeq);
    // const boardCommentReply = await this.boardCommentReplyRepository.findByBoardCommentReplySeq(boardCommentReplySeq);
    //
    // if (boardCommentReply.user.userSeq !== user.userSeq) {
    //   throw new BadRequestException('댓글 답장 작성자만 삭제할 수 있습니다.');
    // }
    //
    // await this.boardCommentReplyRepository.update({ boardCommentReplySeq }, { isDeleted: true, deletedAt: new Date() });
  }

  // 게시판 좋아요(찜)
  async boardLike(params: { boardSeq: number; req: Request }) {
    //   const { boardSeq, req } = params;
    //   const { userSeq } = req.user;
    //
    //   const user = await this.userRepository.findByUserSeq(userSeq);
    //   const board = await this.boardRepository.findByBoardSeq(boardSeq);
    //
    //   const boardLike = await this.boardLikeRepository.findOne({
    //     where: { boardSeq: board.boardSeq, userSeq: user.userSeq },
    //   });
    //
    //   if (boardLike) {
    //     await this.boardLikeRepository.delete({ board, user });
    //   } else {
    //     const newBoardLike = this.boardLikeRepository.create({ board, user });
    //
    //     await this.boardLikeRepository.save(newBoardLike);
    //   }
  }
}
