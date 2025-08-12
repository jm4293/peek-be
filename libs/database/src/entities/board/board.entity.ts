import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BoardTypeEnum } from '@libs/constant/enum/board';

import { KoreanTime } from '@libs/database/decorators';

import { BoardArticle, BoardComment, BoardLike, StockCategory, UserAccount } from '@libs/database/entities';

@Entity()
export class Board {
  constructor(partial?: Partial<Board>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BoardTypeEnum })
  type: BoardTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @KoreanTime()
  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @Exclude()
  @Column()
  stockCategoryId: number;

  @ManyToOne(() => StockCategory, (stockCategory) => stockCategory.boards)
  @JoinColumn({ name: 'stockCategoryId' })
  category: StockCategory;

  @Exclude()
  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.boards)
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;

  @OneToOne(() => BoardArticle, (boardArticle) => boardArticle.board)
  article: BoardArticle;

  @OneToMany(() => BoardComment, (boardComment) => boardComment.board)
  comments: BoardComment[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.board)
  likes: BoardLike[];
}
