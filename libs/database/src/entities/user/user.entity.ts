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

import { UserStatusEnum, UserTypeEnum } from '@libs/constant/enum';

import {
  Board,
  BoardArticle,
  BoardComment,
  BoardLike,
  KisTokenIssue,
  UserAccount,
  UserNotification,
  UserPushToken,
} from '@libs/database/entities';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nickname: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Exclude()
  @Column({ type: 'enum', enum: UserStatusEnum, default: UserStatusEnum.ACTIVE })
  status: UserStatusEnum;

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @OneToMany(() => UserAccount, (userAccount) => userAccount.user)
  userAccounts: UserAccount[];

  @OneToMany(() => UserNotification, (userNotification) => userNotification.user)
  userNotifications: UserNotification[];

  @OneToMany(() => BoardArticle, (boardArticle) => boardArticle.user)
  boardArticles: BoardArticle[];

  @OneToMany(() => BoardComment, (boardComment) => boardComment.user)
  boardComments: BoardComment[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.user)
  boardLikes: BoardLike[];

  // @OneToMany(() => Board, (board) => board.user)
  // boards: Board[];
  //
  // @OneToMany(() => BoardComment, (boardComment) => boardComment.user)
  // boardComments: BoardComment[];
  //
  // @OneToMany(() => BoardLike, (boardLike) => boardLike.user)
  // boardLikes: BoardLike[];

  @OneToMany(() => UserPushToken, (userPushToken) => userPushToken.user)
  userPushTokens: UserPushToken[];

  @OneToMany(() => KisTokenIssue, (kisTokenIssue) => kisTokenIssue.user)
  kisTokenIssues: KisTokenIssue[];
}
