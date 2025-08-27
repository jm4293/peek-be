import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
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

import { GetStockKoreanListDto } from './dto';

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

  async getStockKorean(code: string) {
    const token = await this.kisTokenRepository.getOAuthToken();

    const ret = await firstValueFrom<AxiosResponse<{ output: any }>>(
      this.httpService.get(
        `${this.configService.get('KIS_APP_URL')}/uapi/domestic-stock/v1/quotations/search-info?PDNO=${code}&PRDT_TYPE_CD=300`,
        {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            authorization: `Bearer ${token.token}`,
            appkey: this.configService.get('KIS_APP_KEY'),
            appsecret: this.configService.get('KIS_APP_SECRET'),
            tr_id: 'CTPF1604R',
            custtype: 'P',
          },
        },
      ),
    );

    const { output } = ret.data;

    return output;
  }

  async getStockKoreanList(dto: GetStockKoreanListDto) {
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

    return { stockKoreanList: data, total, nextPage };
  }
}
