import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserAccount } from '../user';
import { Board } from './board.entity';

@Entity()
export class BoardComment {
  constructor(partial?: Partial<BoardComment>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;

  @Exclude()
  @Column()
  boardId: number;

  @ManyToOne(() => Board, (board) => board.boardComments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Exclude()
  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.boardComments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;

  //

  @Column({ type: 'int', nullable: true })
  parentCommentId: number | null;

  @ManyToOne(() => BoardComment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment: BoardComment | null;

  @OneToMany(() => BoardComment, (comment) => comment.parentComment, {
    onDelete: 'CASCADE',
  })
  replies: BoardComment[];
}
