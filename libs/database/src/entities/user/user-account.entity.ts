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

import { UserAccountStatusEnum, UserAccountTypeEnum } from '@libs/constant/enum';

import { BoardArticle, BoardComment, BoardLike, User, UserVisit } from '@libs/database/entities';

@Entity()
export class UserAccount {
  constructor(partial?: Partial<UserAccount>) {
    if (partial) {
      return Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Exclude()
  @Column({ type: 'enum', enum: UserAccountStatusEnum, default: UserAccountStatusEnum.ACTIVE })
  status: UserAccountStatusEnum;

  @Exclude()
  @Column({ type: 'enum', enum: UserAccountTypeEnum })
  userAccountType: UserAccountTypeEnum;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken: string | null;

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

  @ManyToOne(() => User, (user) => user.userAccounts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => UserVisit, (userVisit) => userVisit.userAccount)
  userVisits: UserVisit[];

  @OneToMany(() => BoardArticle, (boardArticle) => boardArticle.userAccount)
  boardArticles: BoardArticle[];

  @OneToMany(() => BoardComment, (boardComment) => boardComment.userAccount)
  boardComments: BoardComment[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.userAccount)
  boardLikes: BoardLike[];
}
