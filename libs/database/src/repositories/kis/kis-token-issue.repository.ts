import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { KisTokenIssue } from '@libs/database/entities';

@Injectable()
export class KisTokenIssueRepository extends Repository<KisTokenIssue> {
  constructor(manager: EntityManager) {
    super(KisTokenIssue, manager);
  }
}
