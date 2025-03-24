import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KisToken, User } from '@libs/database/entities';

@Entity()
export class KisTokenIssue {
  @PrimaryGeneratedColumn()
  kisTokenIssueSeq: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referer: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => KisToken, (kisToken) => kisToken.tokeniseIssues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kisTokenSeq' })
  kisToken: KisToken;

  @ManyToOne(() => User, (user) => user.kisTokenIssues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userSeq' })
  user: User;
}
