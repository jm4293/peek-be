import { Module } from '@nestjs/common';

import { InquiryImageRepository, InquiryReplyRepository, InquiryRepository } from '@database/repositories/inquiry';

import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';

@Module({
  imports: [],
  controllers: [InquiryController],
  providers: [InquiryService, InquiryRepository, InquiryReplyRepository, InquiryImageRepository],
  exports: [],
})
export class InquiryModule {}
