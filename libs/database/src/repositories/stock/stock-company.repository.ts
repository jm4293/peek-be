import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { StockCompany } from '@libs/database/entities';

@Injectable()
export class StockCompanyRepository extends Repository<StockCompany> {
  constructor(manager: EntityManager) {
    super(StockCompany, manager);
  }
}
