import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { StockKoreanIndex } from '@database/entities/stock';

@Injectable()
export class StockKoreanIndexRepository extends Repository<StockKoreanIndex> {
  constructor(manager: EntityManager) {
    super(StockKoreanIndex, manager);
  }
}
