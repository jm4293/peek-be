import { Request } from 'express';
import { FindOptionsOrder, Like } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StockKindEnum } from '@libs/constant';

import { KisToken, StockCompany } from '@libs/database/entities';

import {
  KisTokenIssueRepository,
  KisTokenRepository,
  StockCompanyRepository,
  UserRepository,
} from '@libs/database/repositories';

@Injectable()
export class StockService {
  private kisToken: KisToken | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly stockRepository: StockCompanyRepository,
    private readonly kisTokenRepository: KisTokenRepository,
    private readonly kisTokenIssueRepository: KisTokenIssueRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // 토큰
  async getOuathToken(params: { req: Request }) {
    //   const { req } = params;
    //   const { headers, ip = null, user } = req;
    //   const { 'user-agent': userAgent = null, referer = null } = headers;
    //   const { userSeq } = user;
    //
    //   await this.userRepository.findByUserSeq(userSeq);
    //
    //   const kisToken = await this._getKisToken();
    //
    //   await this.kisTokenIssueRepository.save({ userSeq, kisTokenSeq: kisToken.kisTokenSeq, ip, userAgent, referer });
    //
    //   return { kisToken: kisToken.accessToken };
  }

  async getCodeList(params: { kind: StockKindEnum; text: string }) {
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

  async getCodeDetail(params: { code: number; kind: StockKindEnum }) {
    // const { code } = params;
    //
    // return await this.stockRepository.findOne({ where: { code } });
  }

  private async _getKisToken() {
    if (!this.kisToken) {
      const kisToken = await this.kisTokenRepository.find();

      if (!kisToken || !kisToken[0]) {
        console.error('Kis token이 DB에 존재하지 않습니다.');
      }

      this.kisToken = kisToken[0];
    }

    return this.kisToken;
  }
}
