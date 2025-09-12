import { Request } from 'express';

import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';

import { ParseReqHandler } from '@peek/handler/parseReq';

import { Inquiry } from '@database/entities/inquiry';

import { CreateInquiryDto, GetInquiryDto, GetInquiryListDto, UpdateInquiryDto } from './dto';
import { InquiryService } from './inquiry.service';

@Controller('inquiry')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Get(':inquiryId')
  async getInquiry(@Param() param: GetInquiryDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    const { id } = param;

    const ret = await this.inquiryService.getInquiry(id, accountId);

    return {
      inquiry: new Inquiry(ret),
    };
  }

  @Get()
  async getInquiryList(@Query() query: GetInquiryListDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    const { inquiries, nextPage, total } = await this.inquiryService.getInquiryList({ query, accountId });

    return {
      inquiryList: inquiries.map((item) => new Inquiry(item)),
      total,
      nextPage,
    };
  }

  @Post()
  async createInquiry(@Body() dto: CreateInquiryDto, @Req() req: Request) {
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.inquiryService.createInquiry(dto, accountId);
  }

  @Put(':inquiryId')
  async updateInquiry(@Param() param: GetInquiryDto, @Body() dto: UpdateInquiryDto, @Req() req: Request) {
    const { id } = param;
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.inquiryService.updateInquiry(dto, id, accountId);
  }

  @Delete(':inquiryId')
  async deleteInquiry(@Param() param: GetInquiryDto, @Req() req: Request) {
    const { id } = param;
    const { accountId } = ParseReqHandler.parseReq(req);

    await this.inquiryService.deleteInquiry(id, accountId);
  }
}
