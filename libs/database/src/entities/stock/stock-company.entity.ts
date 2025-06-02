import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BoardCategory } from '@libs/database/entities';

@Entity()
export class StockCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  code: number;

  @Column({ type: 'varchar', nullable: true })
  companyName: string;

  @Column({ type: 'varchar', nullable: true })
  industry: string;

  @Column({ type: 'varchar', nullable: true })
  products: string;

  @Column({ type: 'varchar', nullable: true })
  ceo: string;

  @Column({ type: 'varchar', nullable: true })
  homePage: string;

  @Column({ type: 'varchar', nullable: true })
  listingAt: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @Column()
  boardCategoryId: number;

  @ManyToOne(() => BoardCategory, (boardCategory) => boardCategory.stockCompanies)
  @JoinColumn({ name: 'boardCategoryId' })
  category: BoardCategory;
}
