import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@libs/database/entities';

@Entity()
export class UserPushToken {
  @PrimaryGeneratedColumn()
  userPushTokenSeq: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  pushToken: string | null;

  @Column({ type: 'varchar', length: 255 })
  deviceNo: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.userPushTokens)
  @JoinColumn({ name: 'userSeq' })
  user: User;
}
