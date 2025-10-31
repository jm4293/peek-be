import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { StockKoreanCompany } from '../stock/stock-korean-company.entity';
import { UserAccount } from './user-account.entity';

@Entity()
export class UserStockFavorite {
  constructor(partial?: Partial<UserStockFavorite>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @Exclude()
  @PrimaryColumn()
  userAccountId: number;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.userStockFavorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;

  @Exclude()
  @PrimaryColumn()
  stockKoreanCompanyId: number;

  @ManyToOne(() => StockKoreanCompany, (StockKoreanCompany) => StockKoreanCompany.userStockFavorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stockKoreanCompanyId' })
  stockKoreanCompany: StockKoreanCompany;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
