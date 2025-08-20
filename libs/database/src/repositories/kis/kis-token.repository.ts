import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { KisToken } from '@database/entities/kis';

@Injectable()
export class KisTokenRepository extends Repository<KisToken> {
  constructor(manager: EntityManager) {
    super(KisToken, manager);
  }

  async getToken() {
    const ret = await this.findOne({ where: { id: 1 } });

    if (!ret) {
      throw new Error('Kis token이 DB에 존재하지 않습니다.');
    }

    return ret;
  }
}
