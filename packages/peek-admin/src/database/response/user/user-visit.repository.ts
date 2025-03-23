import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UserVisit } from '../../entities';

@Injectable()
export class UserVisitRepository extends Repository<UserVisit> {
  constructor(manager: EntityManager) {
    super(UserVisit, manager);
  }
}
