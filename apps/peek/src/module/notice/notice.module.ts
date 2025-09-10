import { Module } from '@nestjs/common';

import { NoticeRepository } from '@database/repositories/notice';

import { NoticeController } from './notice.controller';
import { NoticeService } from './notice.service';

@Module({
  imports: [],
  controllers: [NoticeController],
  providers: [NoticeService, NoticeRepository],
  exports: [],
})
export class NoticeModule {}
