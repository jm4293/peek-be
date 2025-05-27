import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Board, UserAccount } from '@libs/database/entities';

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
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.boardLikes, { nullable: true })
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount | null;
}
