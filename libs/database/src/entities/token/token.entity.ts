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
  tokenExpired: string;

  @Column({ type: 'tinyint', nullable: false, enum: TokenTypeEnum })
  tokenType: TokenTypeEnum;

  @Column({ type: 'int', nullable: true })
  expiresIn: number;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
