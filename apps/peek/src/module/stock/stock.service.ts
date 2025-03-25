import { Request } from 'express';
import { FindOptionsOrder, Like } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StockKindEnum } from '@libs/constant';

import { KOSPICode, KisToken } from '@libs/database/entities';

import {
  KOSDAQCodeRepository,
  KOSPICodeRepository,
  KisTokenIssueRepository,
  KisTokenRepository,
  UserRepository,
} from '@libs/database/repositories';

@Injectable()
export class StockService {
  private kisToken: KisToken | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly kospiCodeRepository: KOSPICodeRepository,
    private readonly kosdaqCodeRepository: KOSDAQCodeRepository,
    private readonly kisTokenRepository: KisTokenRepository,
    private readonly kisTokenIssueRepository: KisTokenIssueRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // 토큰
  async getOuathToken(params: { req: Request }) {
    const { req } = params;
    const { headers, ip = null, user } = req;
    const { 'user-agent': userAgent = null, referer = null } = headers;
    const { userSeq } = user;

    await this.userRepository.findByUserSeq(userSeq);

    const kisToken = await this._getKisToken();

    await this.kisTokenIssueRepository.save({ userSeq, kisTokenSeq: kisToken.kisTokenSeq, ip, userAgent, referer });

    return { kisToken: kisToken.accessToken };
  }

  async getCodeList(params: { kind: StockKindEnum; text: string }) {
    const { kind, text } = params;

    let whereCondition = {};
    let orderCondition: FindOptionsOrder<KOSPICode> = { companyName: 'ASC' };

    if (text) {
      whereCondition = { companyName: Like(`%${text}%`) };
    }

    let stocks = [];
    let total = 0;

    if (!kind) {
      const [kospiStocks, kospiTotal] = await this.kospiCodeRepository.findAndCount({
        where: whereCondition,
        order: orderCondition,
      });

      const [kosdaqStocks, kosdaqTotal] = await this.kosdaqCodeRepository.findAndCount({
        where: whereCondition,
        order: orderCondition,
      });

      stocks = [...kospiStocks, ...kosdaqStocks].sort((a, b) => a.companyName.localeCompare(b.companyName));
      total = kospiTotal + kosdaqTotal;
    } else {
      const repository = kind === StockKindEnum.KOSPI ? this.kospiCodeRepository : this.kosdaqCodeRepository;

      const [resultStocks, resultTotal] = await repository.findAndCount({
        where: whereCondition,
        order: orderCondition,
      });

      stocks = resultStocks;
      total = resultTotal;
    }

    return { stocks, total };
  }

  async getCodeDetail(params: { code: number; kind: StockKindEnum }) {
    const { code, kind } = params;

    const repository = kind === StockKindEnum.KOSPI ? this.kospiCodeRepository : this.kosdaqCodeRepository;

    return await repository.findOne({ where: { code } });
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
