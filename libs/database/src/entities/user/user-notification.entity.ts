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

import { UserNotificationTypeEnum } from '@libs/constant/enum';

import { User } from '@libs/database/entities';

@Entity()
export class UserNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserNotificationTypeEnum })
  userNotificationType: UserNotificationTypeEnum;

  @Column({ type: 'varchar', length: 500 })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.userNotifications)
  user: User;
}
