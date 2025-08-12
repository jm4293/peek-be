import { Request } from 'express';
import { DataSource } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { BoardTypeEnum } from '@libs/constant/enum/board';

import { Board, BoardArticle, BoardComment } from '@libs/database/entities';

import {
  BoardArticleRepository,
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
  StockCategoryRepository,
  UserAccountRepository,
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

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // 게시판 카테고리
  async getBoardCategoryList() {
    return await this.stockCategoryRepository.find();
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
    const { page, category } = query;

    const queryBuilder = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.category', 'category')
      .leftJoinAndSelect('board.userAccount', 'userAccount')
      .leftJoinAndSelect('userAccount.user', 'user')
      .loadRelationCountAndMap('board.commentCount', 'board.comments', 'comments', (qb) =>
        qb.andWhere('comments.parentCommentId IS NULL'),
      )
      .loadRelationCountAndMap('board.likeCount', 'board.likes')
      .where('board.deletedAt IS NULL')
      .orderBy('board.createdAt', 'DESC')
      .skip((page - 1) * LIST_LIMIT)
      .take(LIST_LIMIT);

    if (category) {
      queryBuilder.andWhere('board.category = :category', { category });
    }

    const [boards, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { boards, total, nextPage };
  }

  async getMyBoardList(params: { page: number; req: Request }) {
    // const { page, req } = params;
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
    //   .skip((page - 1) * LIMIT)
    //   .take(LIMIT);
    //
    // const [boards, total] = await queryBuilder.getManyAndCount();
    //
    // const hasNextPage = page * LIMIT < total;
    // const nextPage = hasNextPage ? Number(page) + 1 : null;
    //
    // return { boards, total, nextPage };
  }

  async createBoard(params: { dto: CreateBoardDto; accountId: number }) {
    const { dto, accountId } = params;
    const { categoryId, title, content } = dto;

    await this.userAccountRepository.findById(accountId);

    await this.stockCategoryRepository.findById(categoryId);

    await this.dataSource.transaction(async (manager) => {
      const board = manager.getRepository(Board).create({
        type: BoardTypeEnum.GENERAL,
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
    const { page } = query;

    await this.boardRepository.findById(boardId);

    const queryBuilder = this.boardCommentRepository
      .createQueryBuilder('boardComment')
      .leftJoinAndSelect('boardComment.userAccount', 'userAccount')
      .leftJoinAndSelect('userAccount.user', 'user')
      .where('boardComment.boardId = :boardId', { boardId })
      .andWhere('boardComment.deletedAt IS NULL')
      .orderBy('boardComment.createdAt', 'ASC')
      .skip((page - 1) * LIST_LIMIT)
      .take(LIST_LIMIT);

    const [boardComments, total] = await queryBuilder.getManyAndCount();

    const nestedComments = this._nestComments(boardComments);

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { boardComments: nestedComments, total, nextPage };
  }

  async getMyBoardCommentList(params: { page: number; req: Request }) {
    // const { page, req } = params;
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
    //   .skip((page - 1) * LIMIT)
    //   .take(LIMIT);
    //
    // const [boardComments, total] = await queryBuilder.getManyAndCount();
    //
    // const hasNextPage = page * LIMIT < total;
    // const nextPage = hasNextPage ? Number(page) + 1 : null;
    //
    // return { boardComments, total, nextPage };
  }

  async createBoardComment(params: { boardId: number; accountId: number; dto: CreateBoardCommentDto }) {
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
    boardId: number;
    boardCommentId: number;
    accountId: number;
    dto: UpdateBoardCommentDto;
  }) {
    const { boardId, boardCommentId, accountId, dto } = params;
    const { content } = dto;

    await this.userAccountRepository.findById(accountId);
    await this.boardRepository.findById(boardId);
    const comment = await this.boardCommentRepository.findById(boardCommentId);

    if (comment.userAccount.id !== accountId) {
      throw new BadRequestException('댓글 작성자만 수정할 수 있습니다.');
    }

    await this.boardCommentRepository.update({ id: boardCommentId }, { content });
  }

  async deleteBoardComment(params: { boardId: number; boardCommentId: number; accountId: number }) {
    const { boardId, boardCommentId, accountId } = params;

    await this.userAccountRepository.findById(accountId);
    await this.boardRepository.findById(boardId);
    const comment = await this.boardCommentRepository.findById(boardCommentId);

    if (comment.userAccountId !== accountId) {
      throw new BadRequestException('댓글 작성자만 삭제할 수 있습니다.');
    }

    await this.boardCommentRepository.update({ id: boardCommentId }, { deletedAt: new Date() });
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
