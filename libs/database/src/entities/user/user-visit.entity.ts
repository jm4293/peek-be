import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserVisitTypeEnum } from '@constant/enum/user';

import { KoreanTime } from '@database/decorators';

import { UserAccount } from './user-account.entity';

@Entity()
export class UserVisit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'tinyint', enum: UserVisitTypeEnum })
  type: UserVisitTypeEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referer: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.userVisits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;
}
