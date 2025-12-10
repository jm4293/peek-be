import { Injectable } from '@nestjs/common';

import { LIST_LIMIT } from '@peek/shared/constants/list';

import { NoticeRepository } from '@libs/database/repositories/notice';

import { EntityName, EntityRelation } from '@libs/shared/const/entity';

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
      relations: [EntityName.NoticeImage],
      order: { createdAt: 'DESC' },
    });

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { notices, total, nextPage };
  }

  async getNotice(id: number) {
    return await this.noticeRepository.findOne({
      where: { id },
      relations: [EntityName.UserAccount, EntityRelation.UserAccountUser],
    });
  }
}
