import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { KoreanTime } from '@database/decorators';

import { UserAccount } from './user-account.entity';
import { User } from './user.entity';

@Entity()
export class UserPushToken {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ type: 'varchar', length: 500, nullable: true })
  pushToken: string | null;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  deviceNo: string;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @Column()
  userAccountId: number;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.userPushToken)
  @JoinColumn({ name: 'userAccountId', referencedColumnName: 'id' })
  userAccount: UserAccount;
}
