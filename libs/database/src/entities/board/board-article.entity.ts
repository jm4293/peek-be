import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Board } from '@libs/database/entities';

@Entity()
export class BoardArticle {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @Exclude()
  @Column()
  boardId: number;

  @OneToOne(() => Board, (board) => board.article)
  @JoinColumn({ name: 'boardId' })
  board: Board;
}
