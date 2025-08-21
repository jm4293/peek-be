import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserAccountStatusEnum, UserAccountTypeEnum } from '@constant/enum/user';

import { KoreanTime } from '@database/decorators';

import { Board, BoardComment, BoardLike } from '../board';
import { KisTokenIssue } from '../kis';
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

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Exclude()
  @Column({ type: 'enum', enum: UserAccountStatusEnum, default: UserAccountStatusEnum.ACTIVE })
  status: UserAccountStatusEnum;

  @Column({ type: 'enum', enum: UserAccountTypeEnum })
  userAccountType: UserAccountTypeEnum;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken: string | null;

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

  @Exclude()
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.userAccounts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => UserVisit, (userVisit) => userVisit.userAccount)
  userVisits: UserVisit[];

  @OneToMany(() => Board, (board) => board.userAccount)
  boards: Board[];

  @OneToMany(() => BoardComment, (boardComment) => boardComment.userAccount)
  boardComments: BoardComment[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.userAccount)
  boardLikes: BoardLike[];

  @OneToMany(() => KisTokenIssue, (kisTokenIssue) => kisTokenIssue.userAccount)
  kisTokenIssues: KisTokenIssue[];
}
