import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { KisTokenIssue } from '../../entities';

@Injectable()
export class KisTokenIssueRepository extends Repository<KisTokenIssue> {
  constructor(manager: EntityManager) {
    super(KisTokenIssue, manager);
  }
}
