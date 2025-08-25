import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StockCategoryEnum } from '@constant/enum/stock';

import { KisTokenIssueRepository, KisTokenRepository } from '@database/repositories/kis';
import { StockCategoryRepository, StockCompanyRepository } from '@database/repositories/stock';
import { UserAccountRepository, UserRepository } from '@database/repositories/user';

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
    // return await this.stockCategoryRepository.find();
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

  async getCodeList(params: { kind: StockCategoryEnum; text: string }) {
    // const { kind, text } = params;
    //
    // let whereCondition = {};
    // let orderCondition: FindOptionsOrder<StockCompany> = { companyName: 'ASC' };
    //
    // if (kind) {
    //   whereCondition = { ...whereCondition, marketType: kind };
    // }
    //
    // if (text) {
    //   whereCondition = { ...whereCondition, companyName: Like(`%${text}%`) };
    // }
    //
    // const [stocks, total] = await this.stockRepository.findAndCount({
    //   where: whereCondition,
    //   order: orderCondition,
    // });
    //
    // return { stocks, total };
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
