import { Controller, Get, Param, Query } from '@nestjs/common';

import { Public } from '@peek/decorator/public';

import { Notice } from '@database/entities/notice';

import { GetNoticeDto, GetNoticeListDto } from './dto';
import { NoticeService } from './notice.service';

@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Public()
  @Get()
  async getNoticeList(@Query() query: GetNoticeListDto) {
    const { notices, total, nextPage } = await this.noticeService.getNoticeList({ query });

    return {
      noticeList: notices.map((item) => new Notice(item)),
      total,
      nextPage,
    };
  }

  @Public()
  @Get(':noticeId')
  async getNotice(@Param() param: GetNoticeDto) {
    const { noticeId } = param;

    const ret = await this.noticeService.getNotice(noticeId);

    return {
      notice: new Notice(ret),
    };
  }
}
