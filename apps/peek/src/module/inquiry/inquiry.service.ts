import { DataSource } from 'typeorm';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { LIST_LIMIT } from '@peek/constant/list';

import { Inquiry, InquiryImage } from '@database/entities/inquiry';
import { InquiryImageRepository, InquiryReplyRepository, InquiryRepository } from '@database/repositories/inquiry';

import { CreateInquiryDto, GetInquiryListDto, UpdateInquiryDto } from './dto';

@Injectable()
export class InquiryService {
  constructor(
    private readonly inquiryRepository: InquiryRepository,
    private readonly inquiryReplyRepository: InquiryReplyRepository,
    private readonly inquiryImageRepository: InquiryImageRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getInquiry(id: number, accountId: number) {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id, userAccountId: accountId },
      relations: ['images', 'reply'],
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

  async updateInquiry(dto: UpdateInquiryDto, id: number, accountId: number) {
    const { images, ...rest } = dto;

    await this.inquiryRepository.findById(id);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Inquiry).update({ id }, { ...rest });

      if (images && images.length > 0) {
        await manager.getRepository(InquiryImage).delete({ id });

        const inquiryImagesData = images.map((image) => ({
          id,
          image,
        }));

        await manager.getRepository(InquiryImage).insert(inquiryImagesData);
      }
    });
  }

  async deleteInquiry(id: number, accountId: number) {
    await this.inquiryRepository.findById(id);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Inquiry).update({ id }, { deletedAt: new Date() });
    });
  }
}
