import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Notice } from './notice.entity';

@Entity()
export class NoticeImage {
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
  noticeId: number;

  @ManyToOne(() => Notice, (notice) => notice.noticeImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'noticeId' })
  notice: Notice;
}
