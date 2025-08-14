import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { KisTokenIssue } from '@database/entities/kis';

@Injectable()
export class KisTokenIssueRepository extends Repository<KisTokenIssue> {
  constructor(manager: EntityManager) {
    super(KisTokenIssue, manager);
  }
}
