import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { Board } from '@libs/database/entities/board';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(manager: EntityManager) {
    super(Board, manager);
  }

  async findById(id: number) {
    const ret = await this.findOne({ where: { id } });

    if (!ret) {
      throw new BadRequestException('게시물이 존재하지 않습니다.');
    }

    return ret;
  }

  async increaseViewCount(id: number) {
    await this.increment({ id }, 'viewCount', 1);
  }
}
