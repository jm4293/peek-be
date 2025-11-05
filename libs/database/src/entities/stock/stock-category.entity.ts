import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Board } from '../board';
import { StockKoreanCompany } from './stock-korean-company.entity';

@Entity()
export class StockCategory {
  constructor(partial?: Partial<StockCategory>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  enName: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;

  @OneToMany(() => Board, (board) => board.stockCategory, {
    onDelete: 'SET NULL',
  })
  boards: Board[];

  @OneToMany(() => StockKoreanCompany, (stockKoreanCompany) => stockKoreanCompany.stockCategory, {
    onDelete: 'SET NULL',
  })
  stockKoreanCompanies: StockKoreanCompany[];
}
