import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { Board } from '@libs/database/entities';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(manager: EntityManager) {
    super(Board, manager);
  }

  async findByBoardSeq(boardSeq: number) {
    const board = await this.findOne({ where: { boardSeq }, relations: ['user'] });

    if (!board) {
      throw new BadRequestException('게시물이 존재하지 않습니다.');
    }

    return board;
  }

  async increaseBoardViewCount(boardSeq: number) {
    await this.increment({ boardSeq }, 'viewCount', 1);
  }
}
