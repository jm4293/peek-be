import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { TokenTypeEnum } from '@constant/enum/token';

import { Token } from '@database/entities/token';

@Injectable()
export class TokenRepository extends Repository<Token> {
  constructor(manager: EntityManager) {
    super(Token, manager);
  }

  async getSocketToken() {
    const ret = await this.findOne({ where: { tokenType: TokenTypeEnum.SOCKET } });

    if (!ret) {
      throw new Error('socket token이 DB에 존재하지 않습니다.');
    }

    return ret;
  }

  async getOAuthToken() {
    const ret = await this.findOne({ where: { tokenType: TokenTypeEnum.OAUTH } });

    if (!ret) {
      throw new Error('oauth token이 DB에 존재하지 않습니다.');
    }

    return ret;
  }
}
