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

import { BoardArticle, User } from '@libs/database/entities';

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
  boardArticleId: number;

  @ManyToOne(() => BoardArticle, (boardArticle) => boardArticle.comments)
  @JoinColumn({ name: 'boardArticleId' })
  boardArticle: BoardArticle;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.boardComments)
  @JoinColumn({ name: 'userId' })
  user: User;

  //

  @Column({ type: 'int', nullable: true })
  parentCommentId: number | null;

  @ManyToOne(() => BoardComment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment: BoardComment | null;

  @OneToMany(() => BoardComment, (comment) => comment.parentComment)
  replies: BoardComment[];
}
