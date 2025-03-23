import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Column,
  DeleteDateColumn,
} from 'typeorm';
import { UserAccount } from './user-account.entity';
import { UserStatusEnum, UserTypeEnum } from '../../../constant/enum';
import { Board, BoardComment, BoardLike } from '../board';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userSeq: number;

  @Column({ type: 'enum', enum: UserStatusEnum, default: UserStatusEnum.ACTIVE })
  status: UserStatusEnum;

  @Column({ type: 'enum', enum: UserTypeEnum, default: UserTypeEnum.USER })
  type: UserTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  nickname: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean' })
  policy: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true })
  birthdate: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deletedAt: Date | null;

  @OneToMany(() => UserAccount, (userAccount) => userAccount.user)
  userAccounts: UserAccount[];

  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];

  @OneToMany(() => BoardComment, (boardComment) => boardComment.user)
  boardComments: BoardComment[];

  @OneToMany(() => BoardLike, (boardLike) => boardLike.user)
  boardLikes: BoardLike[];
}
