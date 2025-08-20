import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { KoreanTime } from '@database/decorators';

import { KisTokenIssue } from './kis-token-issue.entity';

@Entity()
export class KisToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 512, nullable: false })
  token: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  tokenExpired: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  tokenType: string;

  @Column({ type: 'int', nullable: true })
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
