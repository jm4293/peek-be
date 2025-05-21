import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { StockKindEnum } from '@libs/constant';

import { BoardComment, BoardLike, User } from '@libs/database/entities';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: StockKindEnum })
  marketType: StockKindEnum;

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

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.boards)
  user: User;

  @OneToMany(() => BoardComment, (boardComment) => boardComment.board)
  boardComments: BoardComment[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.board)
  boardLikes: BoardLike[];
}
