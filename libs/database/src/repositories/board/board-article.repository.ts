import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { BoardArticle } from '@libs/database/entities';

@Injectable()
export class BoardArticleRepository extends Repository<BoardArticle> {
  constructor(manager: EntityManager) {
    super(BoardArticle, manager);
  }
}
