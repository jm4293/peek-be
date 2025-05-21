import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { BoardCommentReply } from '@libs/database/entities';

@Injectable()
export class BoardCommentReplyRepository extends Repository<BoardCommentReply> {
  constructor(manager: EntityManager) {
    super(BoardCommentReply, manager);
  }

  async findById(id: number) {
    const ret = await this.findOne({ where: { id }, relations: ['user'] });

    if (!ret) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    return ret;
  }
}
