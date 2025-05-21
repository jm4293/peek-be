import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BoardComment, User } from '@libs/database/entities';

@Entity()
export class BoardCommentReply {
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

  @ManyToOne(() => BoardComment, (boardComment) => boardComment.boardCommentReplies)
  boardComment: BoardComment;
}
