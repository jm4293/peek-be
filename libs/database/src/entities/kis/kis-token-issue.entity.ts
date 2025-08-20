import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { KoreanTime } from '@database/decorators';

import { User, UserAccount } from '../user';
import { KisToken } from './kis-token.entity';

@Entity()
export class KisTokenIssue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referer: string | null;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => KisToken, (kisToken) => kisToken.kisTokenIssues, { onDelete: 'CASCADE' })
  kisToken: KisToken;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.kisTokenIssues, { onDelete: 'CASCADE' })
  userAccount: UserAccount;
}
