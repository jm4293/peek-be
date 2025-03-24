import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';

import { KisTokenIssue } from '@libs/database/entities';

@Injectable()
export class KisTokenIssueRepository extends Repository<KisTokenIssue> {
  constructor(manager: EntityManager) {
    super(KisTokenIssue, manager);
  }
}
