import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class KOSDAQCode {
  @PrimaryGeneratedColumn()
  stockCodeSeq: number;

  @Column({ type: 'int', nullable: true })
  code: number;

  @Column({ type: 'varchar', nullable: true })
  companyName: string;

  @Column({ type: 'varchar', nullable: true })
  industry: string;

  @Column({ type: 'varchar', nullable: true })
  products: string;

  @Column({ type: 'varchar', nullable: true })
  ceo: string;

  @Column({ type: 'varchar', nullable: true })
  homePage: string;

  @Column({ type: 'varchar', nullable: true })
  marketType: string;

  @Column({ type: 'varchar', nullable: true })
  listingAt: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
