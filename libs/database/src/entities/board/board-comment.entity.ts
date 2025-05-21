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

import { Board, BoardCommentReply, User } from '@libs/database/entities';

@Entity()
export class BoardComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.boardComments)
  user: User;

  @ManyToOne(() => Board, (board) => board.boardComments)
  board: Board;

  @OneToMany(() => BoardCommentReply, (boardCommentReply) => boardCommentReply.boardComment)
  boardCommentReplies: BoardCommentReply[];
}
