import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { BoardComment } from '../../entities';
import { ResConfig } from '../../config';

@Injectable()
export class BoardCommentRepository extends Repository<BoardComment> {
  constructor(manager: EntityManager) {
    super(BoardComment, manager);
  }

  async findBoardCommentByBoardCommentSeq(boardCommentSeq: number) {
    const boardComment = await this.findOne({ where: { boardCommentSeq }, relations: ['user'] });

    if (!boardComment) {
      throw ResConfig.Fail_400({ message: '댓글이 존재하지 않습니다.' });
    }

    return boardComment;
  }
}
