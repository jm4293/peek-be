import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { StockCategory } from '@libs/database/entities/stock';

@Injectable()
export class StockCategoryRepository extends Repository<StockCategory> {
  constructor(manager: EntityManager) {
    super(StockCategory, manager);
  }

  findById(id: number): Promise<StockCategory> {
    const ret = this.findOne({ where: { id } });

    if (!ret) {
      throw new BadRequestException('주식 카테고리가 존재하지 않습니다.');
    }

    return ret;
  }

  findByName(name: string): Promise<StockCategory> {
    const ret = this.findOne({ where: { name } });

    if (!ret) {
      throw new BadRequestException('주식 카테고리가 존재하지 않습니다.');
    }

    return ret;
  }

  findByEnName(enName: string): Promise<StockCategory> {
    const ret = this.findOne({ where: { enName } });

    if (!ret) {
      throw new BadRequestException('주식 카테고리가 존재하지 않습니다.');
    }

    return ret;
  }
}
