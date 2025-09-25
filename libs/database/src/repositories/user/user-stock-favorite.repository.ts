import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { UserStockFavorite } from '@database/entities/user';

@Injectable()
export class UserStockFavoriteRepository extends Repository<UserStockFavorite> {
  constructor(manager: EntityManager) {
    super(UserStockFavorite, manager);
  }

  async findByUserAccountIdAndStockCompanyId(userAccountId: number, stockCompanyId: number) {
    return await this.findOneBy({ userAccountId, stockCompanyId });
  }
}
