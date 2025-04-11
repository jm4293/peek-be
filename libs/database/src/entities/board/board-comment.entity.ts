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
  boardCommentSeq: number;

  @Column({ type: 'varchar', length: 255 })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.boardComments)
  @JoinColumn({ name: 'userSeq' })
  user: User;

  @ManyToOne(() => Board, (board) => board.boardComments)
  @JoinColumn({ name: 'boardSeq' })
  board: Board;

  @OneToMany(() => BoardCommentReply, (boardCommentReply) => boardCommentReply.boardComment)
  boardCommentReplies: BoardCommentReply[];
}
