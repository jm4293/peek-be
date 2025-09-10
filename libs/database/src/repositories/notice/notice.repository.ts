import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { Notice } from '@database/entities/notice';

@Injectable()
export class NoticeRepository extends Repository<Notice> {
  constructor(manager: EntityManager) {
    super(Notice, manager);
  }
}
