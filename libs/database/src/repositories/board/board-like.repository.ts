import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { BoardLike } from '@database/entities/board';

@Injectable()
export class BoardLikeRepository extends Repository<BoardLike> {
  constructor(manager: EntityManager) {
    super(BoardLike, manager);
  }
}
