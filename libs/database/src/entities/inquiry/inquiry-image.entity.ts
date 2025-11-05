import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Inquiry } from './inquiry.entity';

@Entity()
export class InquiryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @Column()
  inquiryId: number;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.inquiryImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inquiryId' })
  inquiry: Inquiry;
}
