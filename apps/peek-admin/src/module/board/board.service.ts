import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { ADMIN_LIST_LIMIT } from '@peek-admin/shared/list';
import { GetBoardListDto } from '@peek-admin/type/dto';

import { BoardArticleRepository, BoardCommentRepository, BoardRepository } from '@libs/database/repositories/board';

import { EntityName } from '@libs/shared/const/entity';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly boardArticleRepository: BoardArticleRepository,
    private readonly boardCommentRepository: BoardCommentRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getBoard(boardId: number) {
    // return await this.boardRepository.findById(boardId);
    return await this.boardRepository.findOne({
      where: { id: boardId },
      // relations: ['category', 'userAccount', 'article', 'comments', 'likes'],
      relations: [
        EntityName.StockCategory,
        EntityName.UserAccount,
        EntityName.BoardArticle,
        EntityName.BoardComment,
        EntityName.BoardLike,
      ],
    });
  }

  async getBoardList(query: GetBoardListDto) {
    const { page } = query;

    return await this.boardRepository.findAndCount({
      take: ADMIN_LIST_LIMIT,
      skip: (page - 1) * ADMIN_LIST_LIMIT,
      // relations: ['category', 'userAccount'],
      relations: [EntityName.StockCategory, EntityName.UserAccount],
    });
  }

  async updateBoard(boardSeq: number) {}

  async deleteBoard(boardId: number) {
    await this.boardRepository.findById(boardId);

    await this.dataSource.transaction(async (manager) => {
      // await manager.getRepository(Board).update({ id: boardId }, { deletedAt: new Date() });
      // await manager.getRepository(BoardArticle).update({ boardId }, { deletedAt: new Date() });
      // await manager.getRepository(BoardComment).update({ boardId }, { deletedAt: new Date() });
    });
  }
}
