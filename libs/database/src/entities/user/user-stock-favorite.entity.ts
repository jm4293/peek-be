import { Exclude } from 'class-transformer';
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { KoreanTime } from '@database/decorators';

import { StockCompany } from '../stock/stock-company.entity';
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

  @Exclude()
  @PrimaryColumn()
  stockCompanyId: number;

  @KoreanTime()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.userStockFavorites)
  @JoinColumn({ name: 'userAccountId' })
  userAccount: UserAccount;

  @ManyToOne(() => StockCompany, (stockCompany) => stockCompany.userStockFavorites)
  @JoinColumn({ name: 'stockCompanyId' })
  stockCompany: StockCompany;
}
