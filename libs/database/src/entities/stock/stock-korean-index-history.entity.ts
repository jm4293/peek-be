import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { StockKoreanIndexTypeEnum } from '@constant/enum/stock';

import { KoreanTime } from '@database/decorators';

@Entity()
export class StockKoreanIndexHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: StockKoreanIndexTypeEnum })
  type: StockKoreanIndexTypeEnum;

  @Column({ type: 'varchar', length: 10 })
  time: string;

  @Column({ type: 'varchar', length: 20 })
  jisu: string;

  @Column({ type: 'varchar', length: 10 })
  sign: string;

  @Column({ type: 'varchar', length: 20 })
  change: string;

  @Column({ type: 'varchar', length: 20 })
  drate: string;

  @Column({ type: 'varchar', length: 50 })
  cvolume: string;

  @Column({ type: 'varchar', length: 50 })
  volume: string;

  @Column({ type: 'varchar', length: 50 })
  value: string;

  @Column({ type: 'varchar', length: 10 })
  upjo: string;

  @Column({ type: 'varchar', length: 10 })
  highjo: string;

  @Column({ type: 'varchar', length: 10 })
  unchgjo: string;

  @Column({ type: 'varchar', length: 10 })
  lowjo: string;

  @Column({ type: 'varchar', length: 10 })
  downjo: string;

  @Column({ type: 'varchar', length: 20 })
  upjrate: string;

  @Column({ type: 'varchar', length: 20 })
  openjisu: string;

  @Column({ type: 'varchar', length: 10 })
  opentime: string;

  @Column({ type: 'varchar', length: 20 })
  highjisu: string;

  @Column({ type: 'varchar', length: 10 })
  hightime: string;

  @Column({ type: 'varchar', length: 20 })
  lowjisu: string;

  @Column({ type: 'varchar', length: 10 })
  lowtime: string;

  @Column({ type: 'varchar', length: 50 })
  frgsvolume: string;

  @Column({ type: 'varchar', length: 50 })
  orgsvolume: string;

  @Column({ type: 'varchar', length: 50 })
  frgsvalue: string;

  @Column({ type: 'varchar', length: 50 })
  orgsvalue: string;

  @Column({ type: 'varchar', length: 10 })
  upcode: string;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
