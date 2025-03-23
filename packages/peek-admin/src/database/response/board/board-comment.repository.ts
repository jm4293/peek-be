import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { BoardComment } from '../../entities';

@Injectable()
export class BoardCommentRepository extends Repository<BoardComment> {
  constructor(manager: EntityManager) {
    super(BoardComment, manager);
  }
}
