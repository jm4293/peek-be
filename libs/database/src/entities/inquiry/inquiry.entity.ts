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

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

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

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.inquiries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;

  @OneToOne(() => InquiryReply, (inquiryReply) => inquiryReply.inquiry, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  inquiryReply: InquiryReply;

  @OneToMany(() => InquiryImage, (inquiryImage) => inquiryImage.inquiry, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  inquiryImages: InquiryImage[];
}
