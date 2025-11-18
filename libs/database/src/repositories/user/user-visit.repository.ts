import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { UserVisit } from '@libs/database/entities/user';

@Injectable()
export class UserVisitRepository extends Repository<UserVisit> {
  constructor(manager: EntityManager) {
    super(UserVisit, manager);
  }
}
