import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { KisToken } from '@libs/database/entities';

@Injectable()
export class KisTokenRepository extends Repository<KisToken> {
  constructor(manager: EntityManager) {
    super(KisToken, manager);
  }
}
