import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { KOSDAQCode } from '../../entities';

@Injectable()
export class KOSDAQCodeRepository extends Repository<KOSDAQCode> {
  constructor(manager: EntityManager) {
    super(KOSDAQCode, manager);
  }
}
