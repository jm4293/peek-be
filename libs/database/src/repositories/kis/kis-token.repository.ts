import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { KisTokenType } from '@constant/enum/kis';

import { KisToken } from '@database/entities/kis';

@Injectable()
export class KisTokenRepository extends Repository<KisToken> {
  constructor(manager: EntityManager) {
    super(KisToken, manager);
  }

  async getSocketToken() {
    const ret = await this.findOne({ where: { tokenType: KisTokenType.SOCKET } });

    if (!ret) {
      throw new Error('socket token이 DB에 존재하지 않습니다.');
    }

    return ret;
  }

  async getOAuthToken() {
    const ret = await this.findOne({ where: { tokenType: KisTokenType.OAUTH } });

    if (!ret) {
      throw new Error('oauth token이 DB에 존재하지 않습니다.');
    }

    return ret;
  }
}
