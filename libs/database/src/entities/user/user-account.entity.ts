import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  UserAccountStatus,
  UserAccountStatusValue,
  UserAccountType,
  UserAccountTypeValue,
} from '@libs/shared/const/user';

import { Board, BoardComment, BoardLike } from '../board';
import { Inquiry } from '../inquiry';
import { Notice } from '../notice';
import { UserNotification } from './user-notification.entity';
import { UserOauthToken } from './user-oauth-token.entity';
import { UserPushToken } from './user-push-token.entity';
import { UserStockFavorite } from './user-stock-favorite.entity';
import { UserVisit } from './user-visit.entity';
import { User } from './user.entity';

@Entity()
export class UserAccount {
  constructor(partial?: Partial<UserAccount>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Exclude()
  @Column({ type: 'tinyint', enum: UserAccountStatus, default: UserAccountStatus.ACTIVE })
  status: UserAccountStatusValue;

  @Column({ type: 'tinyint', enum: UserAccountType })
  userAccountType: UserAccountTypeValue;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;

  @Exclude()
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.userAccounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => UserVisit, (userVisit) => userVisit.userAccount, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userVisits: UserVisit[];

  @OneToMany(() => UserNotification, (userNotification) => userNotification.userAccount, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userNotifications: UserNotification[];

  @OneToOne(() => UserOauthToken, (userOauthToken) => userOauthToken.userAccount, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userOauthToken: UserOauthToken;

  @OneToOne(() => UserPushToken, (userPushToken) => userPushToken.userAccount, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userPushToken: UserPushToken;

  @OneToMany(() => UserStockFavorite, (userStockFavorite) => userStockFavorite.userAccount, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userStockFavorites: UserStockFavorite[];

  @OneToMany(() => Board, (board) => board.userAccount, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  boards: Board[];

  @OneToMany(() => BoardComment, (boardComment) => boardComment.userAccount, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  boardComments: BoardComment[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.userAccount, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  boardLikes: BoardLike[];

  @OneToMany(() => Notice, (notice) => notice.userAccount, {
    onDelete: 'SET NULL',
  })
  notices: Notice[];

  @OneToMany(() => Inquiry, (inquiry) => inquiry.userAccount)
  inquiries: Inquiry[];
}
