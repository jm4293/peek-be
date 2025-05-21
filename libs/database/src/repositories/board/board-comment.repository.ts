import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { BoardComment } from '@libs/database/entities';

@Injectable()
export class BoardCommentRepository extends Repository<BoardComment> {
  constructor(manager: EntityManager) {
    super(BoardComment, manager);
  }

  async findById(id: number) {
    const ret = await this.findOne({ where: { id }, relations: ['user'] });

    if (!ret) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    return ret;
  }
}
