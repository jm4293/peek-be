import { TokenProviderKey, TokenProviderValue, TokenType } from 'libs/shared/src/const/token';
import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { securitiesToken } from '@database/entities/stock';

@Injectable()
export class SecuritiesTokenRepository extends Repository<securitiesToken> {
  constructor(manager: EntityManager) {
    super(securitiesToken, manager);
  }

  async getSocketToken(provider: TokenProviderValue) {
    const ret = await this.findOne({ where: { type: TokenType.SOCKET, provider } });

    if (!ret) {
      throw new Error(`${provider} socket token이 DB에 존재하지 않습니다.`);
    }

    return ret;
  }

  async getOAuthToken(provider: TokenProviderValue) {
    const ret = await this.findOne({ where: { type: TokenType.OAUTH, provider } });

    if (!ret) {
      throw new Error('oauth token이 DB에 존재하지 않습니다.');
    }

    return ret;
  }
}
