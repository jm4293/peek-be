import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { UserOauthToken } from '@libs/database/entities/user';

@Injectable()
export class UserOauthTokenRepository extends Repository<UserOauthToken> {
  constructor(manager: EntityManager) {
    super(UserOauthToken, manager);
  }
}
