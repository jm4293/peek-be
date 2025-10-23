import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { KoreanTime } from '@database/decorators';

import { Inquiry } from './inquiry.entity';

@Entity()
export class InquiryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @Column()
  inquiryId: number;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inquiryId' })
  inquiry: Inquiry;
}
