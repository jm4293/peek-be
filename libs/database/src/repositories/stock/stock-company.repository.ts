import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { StockKoreanCompany } from '@libs/database/entities/stock';

@Injectable()
export class StockCompanyRepository extends Repository<StockKoreanCompany> {
  constructor(manager: EntityManager) {
    super(StockKoreanCompany, manager);
  }

  async findById(id: number) {
    const ret = await this.findOne({ where: { id } });

    if (!ret) {
      throw new BadRequestException('종목이 존재하지 않습니다.');
    }

    return ret;
  }
}
