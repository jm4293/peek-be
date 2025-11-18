import { Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { StockKoreanIndexType, StockKoreanIndexTypeValue } from '@libs/shared/const/stock';

@Entity()
export class StockKoreanIndexHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'tinyint', enum: StockKoreanIndexType, comment: '지수 타입 (KOSPI/KOSDAQ)' })
  type: StockKoreanIndexTypeValue;

  @Column({ type: 'varchar', length: 10, comment: '시간' })
  time: string;

  @Column({ type: 'varchar', length: 20, comment: '지수' })
  jisu: string;

  @Column({ type: 'varchar', length: 10, comment: '전일대비구분' })
  sign: string;

  @Column({ type: 'varchar', length: 20, comment: '전일비' })
  change: string;

  @Column({ type: 'varchar', length: 20, comment: '등락율' })
  drate: string;

  @Column({ type: 'varchar', length: 50, comment: '체결량' })
  cvolume: string;

  @Column({ type: 'varchar', length: 50, comment: '거래량' })
  volume: string;

  @Column({ type: 'varchar', length: 50, comment: '거래대금' })
  value: string;

  @Column({ type: 'varchar', length: 10, comment: '상한종목수' })
  upjo: string;

  @Column({ type: 'varchar', length: 10, comment: '상승종목수' })
  highjo: string;

  @Column({ type: 'varchar', length: 10, comment: '보합종목수' })
  unchgjo: string;

  @Column({ type: 'varchar', length: 10, comment: '하락종목수' })
  lowjo: string;

  @Column({ type: 'varchar', length: 10, comment: '하한종목수' })
  downjo: string;

  @Column({ type: 'varchar', length: 20, comment: '상승종목비율' })
  upjrate: string;

  @Column({ type: 'varchar', length: 20, comment: '시가지수' })
  openjisu: string;

  @Column({ type: 'varchar', length: 10, comment: '시가시간' })
  opentime: string;

  @Column({ type: 'varchar', length: 20, comment: '고가지수' })
  highjisu: string;

  @Column({ type: 'varchar', length: 10, comment: '고가시간' })
  hightime: string;

  @Column({ type: 'varchar', length: 20, comment: '저가지수' })
  lowjisu: string;

  @Column({ type: 'varchar', length: 10, comment: '저가시간' })
  lowtime: string;

  @Column({ type: 'varchar', length: 50, comment: '외인순매수수량' })
  frgsvolume: string;

  @Column({ type: 'varchar', length: 50, comment: '기관순매수수량' })
  orgsvolume: string;

  @Column({ type: 'varchar', length: 50, comment: '외인순매수금액' })
  frgsvalue: string;

  @Column({ type: 'varchar', length: 50, comment: '기관순매수금액' })
  orgsvalue: string;

  @Column({ type: 'varchar', length: 10, comment: '업종코드' })
  upcode: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
