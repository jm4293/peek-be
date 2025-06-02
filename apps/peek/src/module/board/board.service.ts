import { Request } from 'express';
import { DataSource } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { BoardTypeEnum } from '@libs/constant/enum/board';

import { Board, BoardArticle, BoardComment } from '@libs/database/entities';

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
  GetBoardCommentListDto,
  GetBoardListDto,
  UpdateBoardCommentDto,
  UpdateBoardDto,
} from '../../type/dto';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardCategoryRepository: BoardCategoryRepository,
    private readonly boardRepository: BoardRepository,
    private readonly boardArticleRepository: BoardArticleRepository,
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

  async getBoardList(params: { query: GetBoardListDto }) {
    const { query } = params;
    const { pageParam, category } = query;

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

  async createBoard(params: { dto: CreateBoardDto; accountId: number }) {
    const { dto, accountId } = params;
    const { categoryId, title, content } = dto;

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

  async updateBoard(params: { boardId: number; dto: UpdateBoardDto; accountId: number }) {
    const { boardId, dto, accountId } = params;

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
  async getBoardCommentList(params: { boardId: number; query: GetBoardCommentListDto }) {
    const { boardId, query } = params;
    const { pageParam } = query;

    await this.boardRepository.findById(boardId);

    const queryBuilder = this.boardCommentRepository
      .createQueryBuilder('boardComment')
      .leftJoinAndSelect('boardComment.userAccount', 'userAccount')
      .leftJoinAndSelect('userAccount.user', 'user')
      .where('boardComment.boardId = :boardId', { boardId })
      .andWhere('boardComment.deletedAt IS NULL')
      .orderBy('boardComment.createdAt', 'ASC')
      .skip((pageParam - 1) * LIST_LIMIT)
      .take(LIST_LIMIT);

    const [boardComments, total] = await queryBuilder.getManyAndCount();

    const nestedComments = this._nestComments(boardComments);

    const hasNextPage = pageParam * LIST_LIMIT < total;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    return { boardComments: nestedComments, total, nextPage };
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

  async createBoardComment(params: { boardId: number; dto: CreateBoardCommentDto; accountId: number }) {
    const { boardId, dto, accountId } = params;
    const { content, commentId } = dto;

    await this.userAccountRepository.findById(accountId);

    await this.boardRepository.findById(boardId);

    const comment = this.boardCommentRepository.create({
      content,
      boardId,
      userAccountId: accountId,
      parentCommentId: commentId || null,
    });

    await this.boardCommentRepository.save(comment);
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

  _nestComments = (comments: BoardComment[]) => {
    const map = comments.reduce(
      (acc, comment) => {
        acc[comment.id] = { ...comment, replies: [] };

        return acc;
      },
      {} as Record<number, BoardComment>,
    );

    return comments.reduce((acc, comment) => {
      if (comment.parentCommentId) {
        map[comment.parentCommentId].replies.push(map[comment.id]);
      } else {
        acc.push(map[comment.id]);
      }

      return acc;
    }, [] as BoardComment[]);
  };
}
