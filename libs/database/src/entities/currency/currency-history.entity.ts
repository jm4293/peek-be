import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CurrencyUnitEnum } from '@constant/enum/currency';

import { KoreanTime } from '@database/decorators';

@Entity()
export class CurrencyHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 3, enum: CurrencyUnitEnum, comment: '통화 코드' })
  curUnit: CurrencyUnitEnum;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '통화 단위 설명' })
  curUnitDesc: string | null;

  @Column({ type: 'varchar', length: 10, comment: '국가/통화명' })
  curNm: string;

  @Column({ type: 'varchar', length: 10 })
  standard: string;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
