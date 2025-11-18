import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { InquiryImage } from '@libs/database/entities/inquiry';

@Injectable()
export class InquiryImageRepository extends Repository<InquiryImage> {
  constructor(manager: EntityManager) {
    super(InquiryImage, manager);
  }
}
