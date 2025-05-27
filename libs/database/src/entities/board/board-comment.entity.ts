import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Board, UserAccount } from '@libs/database/entities';

@Entity()
export class BoardComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @Column()
  boardId: number;

  @ManyToOne(() => Board, (board) => board.comments)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.boardComments)
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;

  //

  @Column({ type: 'int', nullable: true })
  parentCommentId: number | null;

  @ManyToOne(() => BoardComment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment: BoardComment | null;

  @OneToMany(() => BoardComment, (comment) => comment.parentComment)
  replies: BoardComment[];
}
