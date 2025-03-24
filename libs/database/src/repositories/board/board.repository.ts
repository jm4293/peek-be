import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Board } from '@libs/database/entities';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(manager: EntityManager) {
    super(Board, manager);
  }

  // async findBoardByBoardSeq(boardSeq: number) {
  //   const board = await this.findOne({ where: { boardSeq }, relations: ['user'] });
  //
  //   if (!board) {
  //     throw ResConfig.Fail_400({ message: '게시물이 존재하지 않습니다.' });
  //   }
  //
  //   return board;
  // }
  //
  // async increaseBoardViewCount(boardSeq: number) {
  //   await this.increment({ boardSeq }, 'viewCount', 1);
  // }
}
