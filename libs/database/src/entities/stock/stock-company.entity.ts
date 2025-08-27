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

import { KoreanTime } from '@database/decorators';

import { StockCategory } from './stock-category.entity';

@Entity()
export class StockCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  code: string;

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

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @Column()
  stockCategoryId: number;

  @ManyToOne(() => StockCategory, (stockCategory) => stockCategory.stockCompanies)
  @JoinColumn({ name: 'stockCategoryId' })
  category: StockCategory;
}
