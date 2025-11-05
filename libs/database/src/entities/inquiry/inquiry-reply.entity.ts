import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Inquiry } from './inquiry.entity';

@Entity()
export class InquiryReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: null })
  updatedAt: Date | null;

  @Exclude()
  @Column()
  inquiryId: number;

  @OneToOne(() => Inquiry, (inquiry) => inquiry.inquiryReply, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inquiryId' })
  inquiry: Inquiry;
}
