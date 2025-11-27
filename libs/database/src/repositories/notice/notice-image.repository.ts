import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { NoticeImage } from '@libs/database/entities/notice';

@Injectable()
export class NoticeImageRepository extends Repository<NoticeImage> {
  constructor(manager: EntityManager) {
    super(NoticeImage, manager);
  }
}
