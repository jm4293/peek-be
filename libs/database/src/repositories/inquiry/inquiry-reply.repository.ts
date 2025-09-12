import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { InquiryReply } from '@database/entities/inquiry';

@Injectable()
export class InquiryReplyRepository extends Repository<InquiryReply> {
  constructor(manager: EntityManager) {
    super(InquiryReply, manager);
  }
}
