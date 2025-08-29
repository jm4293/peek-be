import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TokenTypeEnum } from '@constant/enum/token';

import { KoreanTime } from '@database/decorators';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 512, nullable: false })
  token: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  tokenExpired: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
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
