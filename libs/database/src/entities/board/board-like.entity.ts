import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Board, UserAccount } from '@libs/database/entities';

@Entity()
export class BoardLike {
  @PrimaryColumn()
  id: number;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  guestIp: string | null;

  @Exclude()
  @Column()
  boardId: number;

  @ManyToOne(() => Board, (board) => board.likes)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Exclude()
  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.boardLikes, { nullable: true })
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount | null;
}
