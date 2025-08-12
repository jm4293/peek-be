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

import { KoreanTime } from '@libs/database/decorators';

import { StockCategory } from '@libs/database/entities';

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
