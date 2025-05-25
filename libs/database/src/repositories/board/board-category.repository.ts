import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { BoardCategory } from '@libs/database/entities';

@Injectable()
export class BoardCategoryRepository extends Repository<BoardCategory> {
  constructor(manager: EntityManager) {
    super(BoardCategory, manager);
  }
}
