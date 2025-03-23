import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { KisTokenIssueRepository, KisTokenRepository, UserRepository } from '../../database/repository';
import { Request } from 'express';
import { ResConfig } from '../../config';
import { KisToken } from '../../database/entities';

@Injectable()
export class StockService {
  private kisToken: KisToken | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

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

    await this.userRepository.findUserByUserSeq(userSeq);

    const kisToken = await this._getKisToken();

    await this.kisTokenIssueRepository.save({ userSeq, kisTokenSeq: kisToken.kisTokenSeq, ip, userAgent, referer });

    return { kisToken: kisToken.accessToken };
  }

  async getCodeList() {
    const ret: any = await firstValueFrom(
      this.httpService.get('http://api.seibro.or.kr/openapi/service/StockSvc/getKDRSecnInfo', {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          serviceKey: `${this.configService.get('DATA_GO_KR_STOCK_CODE_SERVICE_KEY')}`,
          caltotMartTpcd: '12',
        },
      }),
    );

    return ret.data;
  }

  async getCodeDetail(params: { code: string }) {
    const { code } = params;

    const kisToken = await this._getKisToken();

    const ret = await firstValueFrom(
      this.httpService.get(`${this.configService.get('KIS_APP_URL')}/uapi/domestic-stock/v1/quotations/inquire-price`, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${kisToken.accessToken}`,
          appkey: this.configService.get('KIS_APP_KEY'),
          appsecret: this.configService.get('KIS_APP_SECRET'),
          tr_id: 'FHKST01010100',
          custtype: 'P',
        },
        params: {
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_INPUT_ISCD: code,
        },
      }),
    );

    if (ret.status !== 200) {
      throw ResConfig.Fail_400({ message: '종목 조회에 실패하였습니다.' });
    }

    return ret.data;
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
