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
import { User } from '../user';
import { BoardComment } from './board-comment.entity';
import { BoardLike } from './board-like.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  boardSeq: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.boards)
  @JoinColumn({ name: 'userSeq' })
  user: User;

  @OneToMany(() => BoardComment, (boardComment) => boardComment.board)
  boardComments: BoardComment[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.board)
  boardLikes: BoardLike[];

  // 게시판 좋아요 여부
  isLiked?: boolean;
}
