import { DataSource } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { LIST_LIMIT } from '@peek/shared/constants/list';

import { Inquiry, InquiryImage } from '@libs/database/entities/inquiry';
import { InquiryImageRepository, InquiryReplyRepository, InquiryRepository } from '@libs/database/repositories/inquiry';

import { EntityName } from '@libs/shared/const/entity';

import { CreateInquiryDto, GetInquiryListDto, UpdateInquiryDto } from './dto';

@Injectable()
export class InquiryService {
  constructor(
    private readonly inquiryRepository: InquiryRepository,
    private readonly inquiryReplyRepository: InquiryReplyRepository,
    private readonly inquiryImageRepository: InquiryImageRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getInquiry(inquiryId: number, accountId: number) {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId, userAccountId: accountId },
      // relations: ['userAccount', 'inquiryImages', 'inquiryReply'],
      relations: [EntityName.UserAccount, EntityName.InquiryImage, EntityName.InquiryReply],
    });

    if (!inquiry) {
      throw new BadRequestException('문의가 존재하지 않습니다.');
    }

    return inquiry;
  }

  async getInquiryList(params: { query: GetInquiryListDto; accountId: number }) {
    const { query, accountId } = params;
    const { page } = query;

    const [inquiries, total] = await this.inquiryRepository.findAndCount({
      where: { userAccountId: accountId },
      take: LIST_LIMIT,
      skip: (page - 1) * LIST_LIMIT,
    });

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { inquiries, total, nextPage };
  }

  async createInquiry(dto: CreateInquiryDto, accountId: number) {
    const { images, ...rest } = dto;

    await this.dataSource.transaction(async (manager) => {
      const savedInquiry = await manager.getRepository(Inquiry).save({
        ...rest,
        userAccountId: accountId,
      });

      if (images && images.length > 0) {
        const inquiryImagesData = images.map((image) => ({
          inquiryId: savedInquiry.id,
          image,
        }));

        await manager.getRepository(InquiryImage).insert(inquiryImagesData);
      }
    });
  }

  async updateInquiry(dto: UpdateInquiryDto, inquiryId: number, accountId: number) {
    const { images, ...rest } = dto;

    await this.inquiryRepository.findById(inquiryId);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Inquiry).update({ id: inquiryId }, { ...rest });

      if (images && images.length > 0) {
        await manager.getRepository(InquiryImage).delete({ id: inquiryId });

        const inquiryImagesData = images.map((image) => ({
          id: inquiryId,
          image,
        }));

        await manager.getRepository(InquiryImage).insert(inquiryImagesData);
      }
    });
  }

  async deleteInquiry(inquiryId: number, accountId: number) {
    await this.inquiryRepository.findById(inquiryId);
    await this.inquiryRepository.delete({ id: inquiryId });
  }
}
