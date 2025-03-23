import { Injectable } from '@nestjs/common';
import { Board } from '../../entities';
import { EntityManager, Repository } from 'typeorm';
import { ResConfig } from '../../../config';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(manager: EntityManager) {
    super(Board, manager);
  }

  async findBoardByBoardSeq(boardSeq: number) {
    const ret = await this.findOne({ where: { boardSeq } });

    if (!ret) {
      throw ResConfig.Fail_400({ message: '게시판 정보가 없습니다.' });
    }

    return ret;
  }
}
