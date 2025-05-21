import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Board, User } from '@libs/database/entities';

@Entity()
export class BoardLike {
  @PrimaryColumn()
  id: number;

  // @PrimaryColumn()
  // userSeq: number;

  @ManyToOne(() => Board, (board) => board.boardLikes)
  board: Board;

  @ManyToOne(() => User, (user) => user.boardLikes)
  user: User;
}
