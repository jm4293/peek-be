import { FindOptionsOrder, Like } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LIST_LIMIT } from '@peek/shared/constants/list';

import { StockKoreanCompany } from '@libs/database/entities/stock';
import {
  SecuritiesTokenRepository,
  StockCategoryRepository,
  StockCompanyRepository,
  StockKoreanIndexHistoryRepository,
} from '@libs/database/repositories/stock';
import { UserStockFavoriteRepository } from '@libs/database/repositories/user';

import { EntityName } from '@libs/shared/const/entity';
import { TokenProvider } from '@libs/shared/const/token';

import {
  GetStockCandleDto,
  GetStockFavoriteListDto,
  GetStockKoreanListDto,
  GetStockKoreanRankDto,
  UpdateStockFavoriteDto,
} from './dto';

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
    private readonly stockCompanyRepository: StockCompanyRepository,
    private readonly stockKoreanIndexHistoryRepository: StockKoreanIndexHistoryRepository,
    private readonly securitiesTokenRepository: SecuritiesTokenRepository,

    private readonly userStockFavoriteRepository: UserStockFavoriteRepository,
  ) {}

  async onModuleInit() {
    // await this._getKiwoomToken();
    // await this._getLSToken();
  }

  async getStockCategoryList() {
    return await this.stockCategoryRepository.find();
  }

  async getStockKoreanList(dto: GetStockKoreanListDto) {
    const { page, kind, text } = dto;

    let whereCondition = {};
    let orderCondition: FindOptionsOrder<StockKoreanCompany> = { companyName: 'ASC' };

    if (kind) {
      whereCondition = { ...whereCondition, marketType: kind };
    }

    if (text) {
      whereCondition = { ...whereCondition, companyName: Like(`%${text}%`) };
    }

    const [data, total] = await this.stockCompanyRepository.findAndCount({
      skip: (page - 1) * LIST_LIMIT,
      take: LIST_LIMIT,
      where: whereCondition,
      order: orderCondition,
    });

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { data, total, nextPage };
  }

  async getStockKorean(code: string) {
    const ret = await this.httpService.axiosRef.post(
      `${this.KiwoomURL}/api/dostk/stkinfo`,
      { stk_cd: code },
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          authorization: `Bearer ${this.KiwoomToken}`,
          'api-id': 'ka10001',
        },
      },
    );

    return ret.data;
  }

  async getStockKoreanRank(dto: GetStockKoreanRankDto) {
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

  async getStockCandle(code: string, dto: GetStockCandleDto) {
    const { startDate, endDate, limit = 2000 } = dto;

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 5);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : new Date();

    const candleData = await this.stockKoreanIndexHistoryRepository.getCandleData(code, start, end);

    return candleData.slice(-limit);
  }

  async getFavoriteStockList(query: GetStockFavoriteListDto, accountId: number) {
    const { page } = query;

    const [data, total] = await this.userStockFavoriteRepository.findAndCount({
      where: { userAccountId: accountId },
      skip: (page - 1) * LIST_LIMIT,
      take: LIST_LIMIT,
      // relations: ['stockKoreanCompany'],
      relations: [EntityName.StockKoreanCompany],
      order: { createdAt: 'DESC' },
    });

    const hasNextPage = page * LIST_LIMIT < total;
    const nextPage = hasNextPage ? Number(page) + 1 : null;

    return { data, total, nextPage };
  }

  async toggleFavoriteStock(params: { body: UpdateStockFavoriteDto; accountId: number }) {
    const { body, accountId } = params;
    const { stockKoreanCompanyId } = body;

    await this.stockCompanyRepository.findById(stockKoreanCompanyId);

    const ret = await this.userStockFavoriteRepository.findByUserAccountIdAndStockCompanyId(
      accountId,
      stockKoreanCompanyId,
    );

    if (!ret) {
      await this.userStockFavoriteRepository.save({
        userAccountId: accountId,
        stockKoreanCompanyId,
      });
    } else {
      await this.userStockFavoriteRepository.delete({
        userAccountId: accountId,
        stockKoreanCompanyId,
      });
    }
  }

  private async _getKiwoomToken() {
    const ret = await this.securitiesTokenRepository.getOAuthToken(TokenProvider.KIWOOM);

    if (!ret) {
      throw new Error('Kiwoom token이 존재하지 않습니다.');
    }

    this.KiwoomToken = ret.token;
  }

  private async _getLSToken() {
    const ret = await this.securitiesTokenRepository.getOAuthToken(TokenProvider.LS);

    if (!ret) {
      throw new Error('Ls token이 존재하지 않습니다.');
    }

    this.LsWebSocketToken = ret.token;
  }
}
