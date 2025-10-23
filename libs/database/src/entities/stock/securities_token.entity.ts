import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TokenProviderEnum, TokenTypeEnum } from '@constant/enum/token';

import { KoreanTime } from '@database/decorators';

@Entity()
export class securitiesToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'tinyint', enum: TokenProviderEnum })
  provider: TokenProviderEnum;

  @Column({ type: 'varchar', length: 512 })
  token: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  expire: string | null;

  @Column({ type: 'tinyint', enum: TokenTypeEnum })
  type: TokenTypeEnum;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;
}
