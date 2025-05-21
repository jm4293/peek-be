import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserVisitTypeEnum } from '@libs/constant/enum';

import { User } from '@libs/database/entities';

@Entity()
export class UserVisit {
  @PrimaryGeneratedColumn()
  userVisitId: number;

  @Column({ type: 'enum', enum: UserVisitTypeEnum })
  type: UserVisitTypeEnum;

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

  @ManyToOne(() => User, (user) => user.userAccounts, { onDelete: 'CASCADE' })
  user: User;
}
