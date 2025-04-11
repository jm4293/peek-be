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
  boardCommentReplySeq: number;

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

  @ManyToOne(() => BoardComment, (boardComment) => boardComment.boardCommentReplies)
  @JoinColumn({ name: 'boardCommentSeq' })
  boardComment: BoardComment;
}
