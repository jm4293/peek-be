import { FindOptionsOrder, Like } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LIST_LIMIT } from '@peek/constant/list';

import { StockCategoryEnum } from '@constant/enum/stock';

import { StockCompany } from '@database/entities/stock';
import { KisTokenIssueRepository, KisTokenRepository } from '@database/repositories/kis';
import { StockCategoryRepository, StockCompanyRepository } from '@database/repositories/stock';
import { UserAccountRepository, UserRepository } from '@database/repositories/user';

import { GetCodeKoreanListDto } from './dto';

@Injectable()
export class StockService {
  // private kisToken: KisToken | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly stockCategoryRepository: StockCategoryRepository,
    private readonly stockRepository: StockCompanyRepository,

    private readonly kisTokenRepository: KisTokenRepository,
    private readonly kisTokenIssueRepository: KisTokenIssueRepository,
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
  ) {}

  async getStockCategoryList() {
    return await this.stockCategoryRepository.find();
  }

  // 토큰
  async getToken() {
    // const { req } = params;
    // const { headers, ip = null, userAccount } = req;
    // const { 'user-agent': userAgent = null, referer = null } = headers;
    // const { accountId } = userAccount;
    //
    // const account = await this.userAccountRepository.findById(accountId);
    // const kisToken = await this.kisTokenRepository.getToken();
    //
    // await this.kisTokenIssueRepository.save({ ip, userAgent, referer, kisToken, userAccount: account });
    //
    // return { token: kisToken.token };
  }

  async getStockCodeKoreanList(dto: GetCodeKoreanListDto) {
    const { page, kind, text } = dto;

    let whereCondition = {};
    let orderCondition: FindOptionsOrder<StockCompany> = { companyName: 'ASC' };

    if (kind) {
      whereCondition = { ...whereCondition, marketType: kind };
    }

    if (text) {
      whereCondition = { ...whereCondition, companyName: Like(`%${text}%`) };
    }

    const [data, total] = await this.stockRepository.findAndCount({
      skip: (page - 1) * LIST_LIMIT,
      take: LIST_LIMIT,
      where: whereCondition,
      order: orderCondition,
    });

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { stockCodeList: data, total, nextPage };

    // return {
    //   codeList: data,
    //   total,
    // };
  }

  async getCodeDetail(params: { code: number; kind: StockCategoryEnum }) {
    // const { code } = params;
    //
    // return await this.stockRepository.findOne({ where: { code } });
  }

  private async _getKisToken() {
    //   if (!this.kisToken) {
    //     const kisToken = await this.kisTokenRepository.find();
    //
    //     if (!kisToken || !kisToken[0]) {
    //       console.error('Kis token이 DB에 존재하지 않습니다.');
    //     }
    //
    //     this.kisToken = kisToken[0];
    //   }
    //
    //   return this.kisToken;
  }
}
