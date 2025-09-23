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

import { KoreanTime } from '@database/decorators';

import { Board } from './board.entity';

@Entity()
export class BoardArticle {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date;

  @Exclude()
  @Column()
  boardId: number;

  @OneToOne(() => Board, (board) => board.article)
  @JoinColumn({ name: 'boardId' })
  board: Board;
}
