import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { UserAccountTypeEnum } from '@constant/enum/user';

import { UserAccount } from './user-account.entity';

@Entity()
export class UserOauthToken {
  @PrimaryColumn()
  userAccountId: number;

  @PrimaryColumn({ type: 'enum', enum: UserAccountTypeEnum })
  userAccountType: UserAccountTypeEnum;

  @Column({ type: 'varchar', length: 500, nullable: true })
  tokenType: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  accessToken: string;

  @Column({ type: 'integer', nullable: true })
  accessTokenExpire: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshToken: string | null;

  @Column({ type: 'integer', nullable: true })
  refreshTokenExpire: number | null;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.userOauthToken)
  @JoinColumn({ name: 'userAccountId', referencedColumnName: 'id' })
  userAccount: UserAccount;
}
