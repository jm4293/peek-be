import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserNotificationTypeEnum } from '@constant/enum/user';

import { KoreanTime } from '@database/decorators';

import { UserAccount } from './user-account.entity';

@Entity()
export class UserNotification {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ type: 'enum', enum: UserNotificationTypeEnum })
  userNotificationType: UserNotificationTypeEnum;

  @Column({ type: 'varchar', length: 500 })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @KoreanTime()
  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @Exclude()
  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.userNotifications)
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;
}
