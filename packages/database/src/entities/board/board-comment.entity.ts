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
import { User } from '../user';
import { Board } from './board.entity';

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
}
