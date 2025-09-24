import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { KoreanTime } from '@database/decorators';

import { Inquiry } from './inquiry.entity';

@Entity()
export class InquiryReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date;

  @Exclude()
  @Column()
  inquiryId: number;

  @OneToOne(() => Inquiry, (inquiry) => inquiry.reply)
  @JoinColumn({ name: 'inquiryId' })
  inquiry: Inquiry;
}
