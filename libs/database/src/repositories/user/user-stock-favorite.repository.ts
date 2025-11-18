import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { UserStockFavorite } from '@libs/database/entities/user';

@Injectable()
export class UserStockFavoriteRepository extends Repository<UserStockFavorite> {
  constructor(manager: EntityManager) {
    super(UserStockFavorite, manager);
  }

  async findByUserAccountIdAndStockCompanyId(userAccountId: number, stockKoreanCompanyId: number) {
    return await this.findOneBy({ userAccountId, stockKoreanCompanyId });
  }
}
