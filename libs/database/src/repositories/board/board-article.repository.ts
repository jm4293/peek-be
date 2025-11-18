import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { BoardArticle } from '@libs/database/entities/board';

@Injectable()
export class BoardArticleRepository extends Repository<BoardArticle> {
  constructor(manager: EntityManager) {
    super(BoardArticle, manager);
  }

  async findById(id: number): Promise<BoardArticle> {
    const ret = await this.findOne({ where: { id } });

    if (!ret) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    return ret;
  }

  async findByBoardId(boardId: number): Promise<BoardArticle> {
    const ret = await this.findOne({ where: { boardId } });

    if (!ret) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    return ret;
  }
}
