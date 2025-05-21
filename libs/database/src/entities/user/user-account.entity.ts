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

import { UserAccountStatusEnum, UserAccountTypeEnum } from '@libs/constant/enum';

import { User } from '@libs/database/entities';

@Entity()
export class UserAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserAccountStatusEnum, default: UserAccountStatusEnum.ACTIVE })
  status: UserAccountStatusEnum;

  @Column({ type: 'enum', enum: UserAccountTypeEnum })
  userAccountType: UserAccountTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.userAccounts, { onDelete: 'CASCADE' })
  user: User;
}
