import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { BoardComment } from '@libs/database/entities';

@Injectable()
export class BoardCommentRepository extends Repository<BoardComment> {
  constructor(manager: EntityManager) {
    super(BoardComment, manager);
  }

  async findByBoardCommentSeq(boardCommentSeq: number) {
    const boardComment = await this.findOne({ where: { boardCommentSeq }, relations: ['user'] });

    if (!boardComment) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    return boardComment;
  }
}
