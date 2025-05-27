import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { StockCategoryEnum } from '@libs/constant';

import { Board } from '@libs/database/entities';

@Entity()
export class BoardCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: StockCategoryEnum })
  category: StockCategoryEnum;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @OneToMany(() => Board, (board) => board.boardCategory)
  boards: Board[];
}
