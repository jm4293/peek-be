import { Request } from 'express';
import { DataSource } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { NotificationHandler } from '@peek/handler/notification';
import { LIST_LIMIT } from '@peek/shared/constants/list';

import { Board, BoardArticle, BoardComment, BoardLike } from '@libs/database/entities/board';
import {
  BoardArticleRepository,
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
} from '@libs/database/repositories/board';
import { StockCategoryRepository } from '@libs/database/repositories/stock';
import { UserAccountRepository, UserPushTokenRepository, UserRepository } from '@libs/database/repositories/user';

import { BoardType } from '@libs/shared/const/board';
import { EntityName, EntityRelation } from '@libs/shared/const/entity';
import { UserNotificationType } from '@libs/shared/const/user';

import {
  CreateBoardCommentDto,
  CreateBoardDto,
  GetBoardCommentListDto,
  GetBoardListDto,
  UpdateBoardCommentDto,
  UpdateBoardDto,
} from './dto';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly boardArticleRepository: BoardArticleRepository,
    private readonly boardCommentRepository: BoardCommentRepository,
    private readonly boardLikeRepository: BoardLikeRepository,

    private readonly stockCategoryRepository: StockCategoryRepository,

    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userPushTokenRepository: UserPushTokenRepository,

    private readonly notificationHandler: NotificationHandler,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // 게시판
  async getMyBoardList(params: { query: GetBoardListDto; accountId: number }) {
    const { query, accountId } = params;
    const { page } = query;

    const queryBuilder = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.stockCategory', 'stockCategory')
      .loadRelationCountAndMap('board.commentCount', 'board.boardComments', 'boardComments')
      .loadRelationCountAndMap('board.likeCount', 'board.boardLikes')
      .andWhere('board.userAccountId = :accountId', { accountId })
      .orderBy('board.id', 'DESC')
      .skip((page - 1) * LIST_LIMIT)
      .take(LIST_LIMIT);

    const [boards, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { boards, total, nextPage };
  }

  async getBoardList(query: GetBoardListDto) {
    const { page, stockCategory, sort, text } = query;

    const queryBuilder = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.stockCategory', 'stockCategory')
      .leftJoinAndSelect('board.userAccount', 'userAccount')
      .leftJoinAndSelect('userAccount.user', 'user')
      .loadRelationCountAndMap('board.commentCount', 'board.boardComments', 'boardComments')
      .loadRelationCountAndMap('board.likeCount', 'board.boardLikes')
      // .where('board.title LIKE :text', { text: text ? `%${text}%` : '' })
      .orderBy(sort === 'createdAt' ? 'board.createdAt' : 'board.viewCount', 'DESC')
      .skip((page - 1) * LIST_LIMIT)
      .take(LIST_LIMIT);

    if (stockCategory) {
      queryBuilder.andWhere('board.stockCategory = :stockCategory', { stockCategory });
    }

    if (text) {
      queryBuilder.andWhere('board.title LIKE :text', { text: `%${text}%` });
    }

    const [boards, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { boards, total, nextPage };
  }

  async getBoardDetail(boardId: number) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: [
        EntityName.StockCategory,
        EntityName.UserAccount,
        EntityRelation.UserAccountUser,
        EntityName.BoardArticle,
      ],
    });

    if (!board) {
      throw new BadRequestException('게시글을 찾을 수 없습니다.');
    }

    await this.boardRepository.increaseViewCount(boardId);

    return board;
  }

  async createBoard(params: { dto: CreateBoardDto; accountId: number }) {
    const { dto, accountId } = params;
    const { categoryId, title, content } = dto;

    await this.dataSource.transaction(async (manager) => {
      const board = manager.getRepository(Board).create({
        type: BoardType.GENERAL,
        title,
        stockCategoryId: categoryId,
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

  async updateBoard(params: { boardId: number; dto: UpdateBoardDto; accountId: number }) {
    const { boardId, dto, accountId } = params;

    await this._checkBoard({ accountId, boardId });

    await this.dataSource.transaction(async (manager) => {
      const { title, content } = dto;

      await manager.getRepository(Board).update({ id: boardId }, { title });
      await manager.getRepository(BoardArticle).update({ boardId }, { content });
    });
  }

  async deleteBoard(params: { boardId: number; accountId: number }) {
    const { boardId, accountId } = params;

    await this._checkBoard({ accountId, boardId });

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(BoardLike).delete({ boardId });
      await manager.getRepository(BoardComment).delete({ boardId });
      await manager.getRepository(BoardArticle).delete({ boardId });
      await manager.getRepository(Board).delete({ id: boardId });
    });
  }

  // 게시판 댓글
  async getMyBoardCommentList(params: { query: GetBoardCommentListDto; accountId: number }) {
    const { query, accountId } = params;
    const { page } = query;

    const queryBuilder = this.boardCommentRepository
      .createQueryBuilder('boardComment')
      .innerJoinAndSelect('boardComment.board', 'board')
      .leftJoinAndSelect('board.stockCategory', 'stockCategory')
      // .leftJoinAndSelect('boardComment.userAccount', 'userAccount')
      // .leftJoinAndSelect('userAccount.user', 'user')
      .where('boardComment.userAccountId = :accountId', { accountId })
      // .andWhere('boardComment.deletedAt IS NULL')
      .orderBy('boardComment.createdAt', 'DESC')
      .skip((page - 1) * LIST_LIMIT)
      .take(LIST_LIMIT);

    const [boardComments, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { boardComments: boardComments, total, nextPage };
  }

  async getBoardCommentList(params: { boardId: number; query: GetBoardCommentListDto }) {
    const { boardId, query } = params;
    const { page } = query;

    const queryBuilder = this.boardCommentRepository
      .createQueryBuilder('boardComment')
      .leftJoinAndSelect('boardComment.userAccount', 'userAccount')
      .leftJoinAndSelect('userAccount.user', 'user')
      .where('boardComment.boardId = :boardId', { boardId })
      .orderBy('boardComment.createdAt', 'ASC')
      .skip((page - 1) * LIST_LIMIT)
      .take(LIST_LIMIT);

    const [boardComments, total] = await queryBuilder.getManyAndCount();

    const nestedComments = this._nestComments(boardComments);

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { boardComments: nestedComments, total, nextPage };
  }

  async createBoardComment(params: { boardId: number; accountId: number; dto: CreateBoardCommentDto }) {
    const { boardId, dto, accountId } = params;
    const { content, boardCommentId } = dto;

    const board = await this.boardRepository.findById(boardId);

    const userPushToken = await this.userPushTokenRepository.findOne({ where: { userAccountId: board.userAccountId } });

    const comment = this.boardCommentRepository.create({
      content,
      boardId,
      userAccountId: accountId,
      parentCommentId: boardCommentId || null,
    });

    await this.boardCommentRepository.save(comment);

    if (!boardCommentId) {
      if (userPushToken) {
        await this.notificationHandler.sendPushNotification({
          pushToken: userPushToken.pushToken,
          message: content,
          userNotificationType: UserNotificationType.BOARD_COMMENT,
          accountId: board.userAccountId,
        });
      }
    }
  }

  async updateBoardComment(params: {
    boardId: number;
    boardCommentId: number;
    accountId: number;
    dto: UpdateBoardCommentDto;
  }) {
    const { boardId, boardCommentId, accountId, dto } = params;
    const { content } = dto;

    const comment = await this.boardCommentRepository.findById(boardCommentId);

    if (comment.userAccount.id !== accountId) {
      throw new BadRequestException('댓글 작성자만 수정할 수 있습니다.');
    }

    await this.boardCommentRepository.update({ id: boardCommentId }, { content });
  }

  async deleteBoardComment(params: { boardId: number; boardCommentId: number; accountId: number }) {
    const { boardId, boardCommentId, accountId } = params;

    const comment = await this.boardCommentRepository.findById(boardCommentId);

    if (comment.userAccountId !== accountId) {
      throw new BadRequestException('댓글 작성자만 삭제할 수 있습니다.');
    }

    const isParent = await this.boardCommentRepository.exists({
      where: { parentCommentId: boardCommentId },
    });

    if (isParent) {
      throw new BadRequestException('하위 댓글이 있는 댓글은 삭제할 수 없습니다.');
    }

    await this.boardCommentRepository.delete({ id: boardCommentId });
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

  private async _checkBoard(params: { accountId: number; boardId: number }) {
    const { accountId, boardId } = params;

    await this.userAccountRepository.findById(accountId);

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      // relations: ['userAccount'],
      relations: [EntityName.UserAccount],
    });

    if (accountId !== board.userAccount.id) {
      throw new BadRequestException('게시물 작성자만 수정할 수 있습니다.');
    }

    await this.boardArticleRepository.findByBoardId(boardId);
  }

  private _nestComments = (comments: BoardComment[]) => {
    const map = comments.reduce(
      (acc, comment) => {
        acc[comment.id] = { ...comment, replies: [] };

        return acc;
      },
      {} as Record<number, BoardComment>,
    );

    return comments.reduce((acc, comment) => {
      // if (comment.deletedAt) {
      //   if (comment.parentCommentId) {
      //     return acc; // 삭제된 대댓글은 숨김
      //   } else {
      //     map[comment.id].content = '삭제된 댓글입니다.'; // 삭제된 부모댓글은 내용만 변경
      //     map[comment.id].userAccount.user.nickname = '-'; // 사용자 이름도 변경
      //   }
      // }

      if (comment.parentCommentId) {
        map[comment.parentCommentId].replies.push(map[comment.id]);
      } else {
        acc.push(map[comment.id]);
      }

      return acc;
    }, [] as BoardComment[]);
  };
}
