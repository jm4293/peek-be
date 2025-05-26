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

import { UserNotificationTypeEnum } from '@libs/constant/enum';

import { User } from '@libs/database/entities';

@Entity()
export class UserNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ type: 'enum', enum: UserNotificationTypeEnum })
  userNotificationType: UserNotificationTypeEnum;

  @Column({ type: 'varchar', length: 500 })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @Exclude()
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.userNotifications)
  @JoinColumn({ name: 'userId' })
  user: User;
}
