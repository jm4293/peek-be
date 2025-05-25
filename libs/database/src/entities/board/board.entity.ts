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

import { BoardTypeEnum } from '@libs/constant/enum/board';

import { BoardArticle, BoardCategory, BoardLike } from '@libs/database/entities';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BoardTypeEnum })
  type: BoardTypeEnum;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @OneToMany(() => BoardArticle, (boardArticle) => boardArticle.board)
  boardArticles: BoardArticle[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.board)
  boardLikes: BoardLike[];

  @Column()
  boardCategoryId: number;

  @ManyToOne(() => BoardCategory, (boardCategory) => boardCategory.boards)
  @JoinColumn({ name: 'boardCategoryId' })
  boardCategory: BoardCategory;
}
