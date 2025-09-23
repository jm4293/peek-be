import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TokenProviderEnum, TokenTypeEnum } from '@constant/enum/token';

import { KoreanTime } from '@database/decorators';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', nullable: false, enum: TokenProviderEnum })
  provider: TokenProviderEnum;

  @Column({ type: 'varchar', length: 512, nullable: false })
  token: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  expire: string;

  @Column({ type: 'tinyint', nullable: false, enum: TokenTypeEnum })
  type: TokenTypeEnum;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date;
}
