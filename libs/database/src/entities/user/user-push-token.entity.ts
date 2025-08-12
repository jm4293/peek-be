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

import { KoreanTime } from '@libs/database/decorators';

import { User } from '@libs/database/entities';

@Entity()
export class UserPushToken {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ type: 'varchar', length: 500, nullable: true })
  pushToken: string | null;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  deviceNo: string;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Exclude()
  @KoreanTime()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Exclude()
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.userPushTokens)
  @JoinColumn({ name: 'userId' })
  user: User;
}
