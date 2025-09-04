import { FindOptionsOrder, Like } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LIST_LIMIT } from '@peek/constant/list';

import { TokenProviderEnum } from '@constant/enum/token';

import { StockCompany } from '@database/entities/stock';
import {
  StockCategoryRepository,
  StockCompanyRepository,
  StockKoreanIndexRepository,
} from '@database/repositories/stock';
import { TokenRepository } from '@database/repositories/token';
import { UserAccountRepository, UserRepository } from '@database/repositories/user';

import { GetStockCandleDto, GetStockKoreanListDto, GetStockKoreanRankDto } from './dto';

@Injectable()
export class StockService implements OnModuleInit {
  private readonly KiwoomURL = 'https://api.kiwoom.com';
  private KiwoomToken: string | null = null;

  private readonly LsURL = 'https://openapi.ls-sec.co.kr:8080';
  private LsWebSocketToken: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly stockCategoryRepository: StockCategoryRepository,
    private readonly stockRepository: StockCompanyRepository,
    private readonly stockKoreanIndexRepository: StockKoreanIndexRepository,

    private readonly tokenRepository: TokenRepository,
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
  ) {}

  async onModuleInit() {
    // await this._getKiwoomToken();
    // await this._getLSToken();
  }

  async getStockCategoryList() {
    return await this.stockCategoryRepository.find();
  }

  async getStockKorean(code: string) {
    if (!this.KiwoomToken) {
      await this._getKiwoomToken();
    }

    const ret = await this.httpService.axiosRef.get(`${this.KiwoomURL}/api/dostk/stkinfo`, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${this.KiwoomToken}`,
        'api-id': 'ka00198',
      },
    });

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

    return { data, total, nextPage };
  }

  async getStockKoreanRank(dto: GetStockKoreanRankDto) {
    // const ret = await this.httpService.axiosRef.post(
    //   `${this.KiwoomURL}/api/dostk/stkinfo`,
    //   { qry_tp: '4' },
    //   {
    //     headers: {
    //       'content-type': 'application/json; charset=utf-8',
    //       authorization: `Bearer ${this.KiwoomToken}`,
    //       'api-id': 'ka00198',
    //     },
    //   },
    // );

    if (!this.LsWebSocketToken) {
      await this._getLSToken();
    }

    const { page, type } = dto;

    if (page > 5) {
      return {
        data: [],
        total: 100,
        nextPage: null,
      };
    }

    const ret = await this.httpService.axiosRef.post<{ t1444OutBlock1: [] }>(
      `${this.LsURL}/stock/high-item`,
      { t1444InBlock: { upcode: '001', idx: (page - 1) * 20 } },
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          authorization: `Bearer ${this.LsWebSocketToken}`,
          tr_cd: type,
          tr_cont: 'Y',
        },
      },
    );

    const { t1444OutBlock1 } = ret.data;

    return { data: t1444OutBlock1, total: 100, nextPage: Number(page) + 1 };
  }

  private async _getKiwoomToken() {
    const ret = await this.tokenRepository.getOAuthToken(TokenProviderEnum.KIWOOM);

    if (!ret) {
      throw new Error('Kiwoom token이 존재하지 않습니다.');
    }

    this.KiwoomToken = ret.token;
  }

  private async _getLSToken() {
    const ret = await this.tokenRepository.getOAuthToken(TokenProviderEnum.LS);

    if (!ret) {
      throw new Error('Ls token이 존재하지 않습니다.');
    }

    this.LsWebSocketToken = ret.token;
  }

  async getStockCandle(code: string, dto: GetStockCandleDto) {
    const { startDate, endDate, limit = 200 } = dto;

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 1);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : new Date();

    const candleData = await this.stockKoreanIndexRepository.getCandleData(code, start, end);

    return candleData.slice(-limit);
  }
}
