import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { NoticeType, NoticeTypeValue } from '@libs/shared/const/notice';

import { UserAccount } from '../user';
import { NoticeImage } from './notice-images.entity';

@Entity()
export class Notice {
  constructor(partial?: Partial<Notice>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'tinyint', enum: NoticeType })
  type: NoticeTypeValue;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;

  @Exclude()
  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.notices, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;

  @OneToMany(() => NoticeImage, (noticeImages) => noticeImages.notice, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  noticeImages: NoticeImage[];
}
