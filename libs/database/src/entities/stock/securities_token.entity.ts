import { Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TokenProvider, TokenProviderValue, TokenType, TokenTypeValue } from '@libs/shared/const/token';

@Entity()
export class securitiesToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'tinyint', enum: TokenProvider })
  provider: TokenProviderValue;

  @Column({ type: 'varchar', length: 512 })
  token: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  expire: string | null;

  @Column({ type: 'tinyint', enum: TokenType })
  type: TokenTypeValue;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;
}
