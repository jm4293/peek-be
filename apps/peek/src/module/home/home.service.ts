import { Injectable } from '@nestjs/common';

import { BoardRepository } from '@libs/database/repositories/board';

@Injectable()
export class HomeService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async getRecentBoards() {
    // const LIMIT = 5;
    //
    // const queryBuilder: SelectQueryBuilder<Board> = this.boardRepository
    //   .createQueryBuilder('board')
    //   .loadRelationCountAndMap('board.likeCount', 'board.boardLikes')
    //   .loadRelationCountAndMap('board.commentCount', 'board.boardComments', 'boardComments', (qb) =>
    //     qb.andWhere('boardComments.isDeleted = :isDeleted', { isDeleted: false }),
    //   )
    //   .where('board.isDeleted = :isDeleted', { isDeleted: false })
    //   .leftJoin('board.boardLikes', 'joinedBoardLike')
    //   .addSelect('COUNT(joinedBoardLike.boardSeq)', 'likeCount')
    //   .groupBy('board.boardSeq')
    //   .having('COUNT(joinedBoardLike.boardSeq) > 0')
    //   .orderBy('likeCount', 'DESC')
    //   .addOrderBy('board.createdAt', 'DESC')
    //   .take(LIMIT);
    //
    // const boards = await queryBuilder.getMany();
    //
    // return { boards };
  }
}
