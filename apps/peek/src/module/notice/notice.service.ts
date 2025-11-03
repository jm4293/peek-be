import { Injectable } from '@nestjs/common';

import { ENTITY_RELATIONS } from '@peek/constant/entity';
import { LIST_LIMIT } from '@peek/constant/list';

import { NoticeRepository } from '@database/repositories/notice';

import { GetNoticeListDto } from './dto';

@Injectable()
export class NoticeService {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async getNoticeList(params: { query: GetNoticeListDto }) {
    const { query } = params;
    const { page } = query;

    const [notices, total] = await this.noticeRepository.findAndCount({
      skip: (page - 1) * LIST_LIMIT,
      take: LIST_LIMIT,
    });

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { notices, total, nextPage };
  }

  async getNotice(id: number) {
    return await this.noticeRepository.findOne({
      where: { id },
      relations: [ENTITY_RELATIONS.NOTICE.USER_ACCOUNT, ENTITY_RELATIONS.NOTICE.USER_ACCOUNT_USER],
    });
  }
}
