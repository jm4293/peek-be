import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { UserAccount } from '../user';
import { Board } from './board.entity';

@Entity()
export class BoardLike {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  guestIp: string | null;

  @Exclude()
  @Column()
  boardId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Board, (board) => board.boardLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Exclude()
  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.boardLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount | null;
}
