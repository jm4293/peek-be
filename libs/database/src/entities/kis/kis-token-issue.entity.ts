import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { KoreanTime } from '@libs/database/decorators';

import { KisToken, User } from '@libs/database/entities';

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

  @ManyToOne(() => User, (user) => user.kisTokenIssues, { onDelete: 'CASCADE' })
  user: User;
}
