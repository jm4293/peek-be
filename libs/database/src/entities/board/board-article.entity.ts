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

import { Board, BoardComment, User } from '@libs/database/entities';

@Entity()
export class BoardArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @OneToMany(() => BoardComment, (boardComment) => boardComment.boardArticle)
  comments: BoardComment[];

  @Column()
  boardId: number;

  @ManyToOne(() => Board, (board) => board.boardArticles)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.boardArticles)
  @JoinColumn({ name: 'userId' })
  user: User;
}
