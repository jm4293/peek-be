import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { KoreanTime } from '@libs/database/decorators';

import { KisTokenIssue } from '@libs/database/entities';

@Entity()
export class KisToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 512 })
  accessToken: string;

  @Column({ type: 'varchar', length: 32 })
  accessTokenExpired: string;

  @Column({ type: 'varchar', length: 8 })
  tokenType: string;

  @Column({ type: 'int' })
  expiresIn: number;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => KisTokenIssue, (kisTokenIssue) => kisTokenIssue.kisToken)
  kisTokenIssues: KisTokenIssue[];
}
