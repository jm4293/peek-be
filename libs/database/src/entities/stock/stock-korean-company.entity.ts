import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserStockFavorite } from '../user';
import { StockCategory } from './stock-category.entity';

@Entity()
export class StockKoreanCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  code: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  products: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ceo: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  homePage: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  listingAt: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;

  @Exclude()
  @Column()
  stockCategoryId: number;

  @ManyToOne(() => StockCategory, (stockCategory) => stockCategory.stockKoreanCompanies, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'stockCategoryId' })
  stockCategory: StockCategory;

  @OneToMany(() => UserStockFavorite, (userStockFavorite) => userStockFavorite.stockKoreanCompany, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userStockFavorites: UserStockFavorite[];
}
