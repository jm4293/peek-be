import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Board, User } from '@libs/database/entities';

@Entity()
export class BoardLike {
  @PrimaryColumn()
  boardSeq: number;

  @PrimaryColumn()
  userSeq: number;

  @ManyToOne(() => Board, (board) => board.boardLikes)
  @JoinColumn({ name: 'boardSeq' })
  board: Board;

  @ManyToOne(() => User, (user) => user.boardLikes)
  @JoinColumn({ name: 'userSeq' })
  user: User;
}
