import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserTypeEnum } from '@constant/enum/user';

import { KoreanTime } from '@database/decorators';

import { UserAccount } from './user-account.entity';
import { UserNotification } from './user-notification.entity';
import { UserPushToken } from './user-push-token.entity';

@Entity()
export class User {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Exclude()
  @Column({ type: 'enum', enum: UserTypeEnum, default: UserTypeEnum.USER })
  type: UserTypeEnum;

  @Exclude()
  @Column({ type: 'boolean' })
  policy: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true })
  birthday: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string | null;

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

  @OneToMany(() => UserAccount, (userAccount) => userAccount.user)
  userAccounts: UserAccount[];
}
