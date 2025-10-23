import { Column, CreateDateColumn, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { UserAccountTypeEnum } from '@constant/enum/user';

import { KoreanTime } from '@database/decorators';

import { UserAccount } from './user-account.entity';

@Entity()
export class UserOauthToken {
  @PrimaryColumn()
  userAccountId: number;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.userOauthToken, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userAccountId', referencedColumnName: 'id' })
  userAccount: UserAccount;

  @PrimaryColumn({ type: 'tinyint', enum: UserAccountTypeEnum })
  userAccountType: UserAccountTypeEnum;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tokenType: string | null;

  @Column({ type: 'text', nullable: true })
  accessToken: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  accessTokenExpire: string | null;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  refreshTokenExpire: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
