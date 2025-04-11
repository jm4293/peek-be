import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { BoardCommentReply } from '@libs/database/entities';

@Injectable()
export class BoardCommentReplyRepository extends Repository<BoardCommentReply> {
  constructor(manager: EntityManager) {
    super(BoardCommentReply, manager);
  }

  async findByBoardCommentReplySeq(boardCommentReplySeq: number) {
    const boardCommentReply = await this.findOne({ where: { boardCommentReplySeq }, relations: ['user'] });

    if (!boardCommentReply) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    return boardCommentReply;
  }
}
