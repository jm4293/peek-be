import { Injectable } from '@nestjs/common';

import { BoardRepository } from '@libs/database/repositories';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async getBoards(params: { pageParam: number }) {
    const { pageParam } = params;

    const limit = 10;
    const offset = (pageParam - 1) * limit;

    const [boards, total] = await this.boardRepository.findAndCount({ skip: offset, take: limit });

    return { boards, total };
  }

  async getBoard(boardSeq: number) {
    return await this.boardRepository.findByBoardSeq(boardSeq);
  }

  async updateBoard(boardSeq: number) {}

  async deleteBoard(boardSeq: number) {}
}
