import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { BoardCategory } from '@libs/database/entities';

@Injectable()
export class BoardCategoryRepository extends Repository<BoardCategory> {
  constructor(manager: EntityManager) {
    super(BoardCategory, manager);
  }

  findById(id: number): Promise<BoardCategory> {
    const ret = this.findOne({ where: { id } });

    if (!ret) {
      throw new BadRequestException('게시판 카테고리가 존재하지 않습니다.');
    }

    return ret;
  }

  findByName(name: string): Promise<BoardCategory> {
    const ret = this.findOne({ where: { name } });

    if (!ret) {
      throw new BadRequestException('게시판 카테고리가 존재하지 않습니다.');
    }

    return ret;
  }

  findByEnName(enName: string): Promise<BoardCategory> {
    const ret = this.findOne({ where: { enName } });

    if (!ret) {
      throw new BadRequestException('게시판 카테고리가 존재하지 않습니다.');
    }

    return ret;
  }
}
