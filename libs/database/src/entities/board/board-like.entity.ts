import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Board, User } from '@libs/database/entities';

@Entity()
export class BoardLike {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guestIp: string | null;

  @Column()
  boardId: number;

  @ManyToOne(() => Board, (board) => board.boardLikes)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.boardLikes, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;
}
