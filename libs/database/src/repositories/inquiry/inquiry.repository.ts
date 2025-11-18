import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';

import { Inquiry } from '@libs/database/entities/inquiry';

@Injectable()
export class InquiryRepository extends Repository<Inquiry> {
  constructor(manager: EntityManager) {
    super(Inquiry, manager);
  }

  async findById(id: number) {
    const ret = await this.findOne({ where: { id } });

    if (!ret) {
      throw new BadRequestException('문의가 존재하지 않습니다.');
    }

    return ret;
  }
}
