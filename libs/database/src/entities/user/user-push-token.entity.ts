import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from '@libs/database/entities';

@Entity()
export class UserPushToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  pushToken: string | null;

  @Column({ type: 'varchar', length: 255 })
  deviceNo: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.userPushTokens)
  user: User;
}
