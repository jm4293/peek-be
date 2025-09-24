import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { KoreanTime } from '@database/decorators';

import { UserAccount } from '../user';
import { InquiryImage } from './inquiry-image.entity';
import { InquiryReply } from './inquiry-reply.entity';

@Entity()
export class Inquiry {
  constructor(partial?: Partial<Inquiry>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date;

  @Exclude()
  @Column()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.inquiries)
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;

  @OneToOne(() => InquiryReply, (inquiryReply) => inquiryReply.inquiry)
  reply: InquiryReply;

  @OneToMany(() => InquiryImage, (inquiryImage) => inquiryImage.inquiry)
  images: InquiryImage[];
}
