import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BoardType, BoardTypeValue } from '@libs/shared/const/board';

import { StockCategory } from '../stock';
import { UserAccount } from '../user';
import { BoardArticle } from './board-article.entity';
import { BoardComment } from './board-comment.entity';
import { BoardLike } from './board-like.entity';

@Entity()
export class Board {
  constructor(partial?: Partial<Board>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'tinyint', enum: BoardType })
  type: BoardTypeValue;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;

  @Exclude()
  @Column()
  stockCategoryId: number;

  @ManyToOne(() => StockCategory, (stockCategory) => stockCategory.boards, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'stockCategoryId' })
  stockCategory: StockCategory;

  @Exclude()
  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.boards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;

  @OneToOne(() => BoardArticle, (boardArticle) => boardArticle.board, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  boardArticle: BoardArticle;

  @OneToMany(() => BoardComment, (boardComment) => boardComment.board, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  boardComments: BoardComment[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.board, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  boardLikes: BoardLike[];
}
