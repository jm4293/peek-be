import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { KOSDAQCode } from '@libs/database/entities';

@Injectable()
export class KOSDAQCodeRepository extends Repository<KOSDAQCode> {
  constructor(manager: EntityManager) {
    super(KOSDAQCode, manager);
  }
}
