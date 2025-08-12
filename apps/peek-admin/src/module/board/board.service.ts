import { Board, BoardArticle, BoardArticleRepository, BoardComment, BoardCommentRepository } from '@libs/database';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { BoardRepository } from '@libs/database/repositories';

import { LIST_LIMIT } from '../../constant/list';
import { GetBoardListDto } from '../../type/dto';

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
      relations: ['category', 'userAccount', 'article', 'comments', 'likes'],
    });
  }

  async getBoardList(query: GetBoardListDto) {
    const { page } = query;

    return await this.boardRepository.findAndCount({
      take: LIST_LIMIT,
      skip: (page - 1) * LIST_LIMIT,
      relations: ['category', 'userAccount'],
    });
  }

  async updateBoard(boardSeq: number) {}

  async deleteBoard(boardId: number) {
    await this.boardRepository.findById(boardId);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Board).update({ id: boardId }, { deletedAt: new Date() });

      await manager.getRepository(BoardArticle).update({ boardId }, { deletedAt: new Date() });

      await manager.getRepository(BoardComment).update({ boardId }, { deletedAt: new Date() });
    });
  }
}
