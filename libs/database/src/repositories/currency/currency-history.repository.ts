import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { CurrencyHistory } from '@database/entities/currency';

@Injectable()
export class CurrencyHistoryRepository extends Repository<CurrencyHistory> {
  constructor(manager: EntityManager) {
    super(CurrencyHistory, manager);
  }
}
