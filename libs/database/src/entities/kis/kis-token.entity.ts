import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => KisTokenIssue, (kisTokenIssue) => kisTokenIssue.kisToken)
  kisTokenIssues: KisTokenIssue[];
}
