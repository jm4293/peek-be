import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserTypeEnum } from '@constant/enum/user';

import { UserAccount } from './user-account.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Exclude()
  @Column({ type: 'tinyint', enum: UserTypeEnum, default: UserTypeEnum.USER })
  type: UserTypeEnum;

  @Exclude()
  @Column({ type: 'boolean' })
  policy: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  birthday: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  thumbnail: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;

  @OneToMany(() => UserAccount, (userAccount) => userAccount.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userAccounts: UserAccount[];
}
