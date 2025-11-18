import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';

import { KisKoreanIndexGateway } from '@peek/module/websocket';

import { SecuritiesTokenRepository } from '@libs/database/repositories/stock';

import { TokenProvider, TokenType } from '@libs/shared/const/token';

@Injectable()
export class KisTokenScheduleService implements OnModuleInit {
  private readonly URL = 'https://openapi.koreainvestment.com:9443';
  private readonly logger = new Logger(KisTokenScheduleService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly securitiesTokenRepository: SecuritiesTokenRepository,

    private readonly kisKoreanIndexGateway: KisKoreanIndexGateway,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.kisKoreanIndexGateway.closeKisConnection();

    // await this._tokenRevoke();
    // await this._tokenIssue();
    await this.kisKoreanIndexGateway.setKisToken();
    await this.kisKoreanIndexGateway.connectToKis();
    await this.kisKoreanIndexGateway.initKoreanIndex();
  }

  @Cron('0 8 * * *', { name: 'kis stock Token', timeZone: 'Asia/Seoul' })
  private async _getKisTokenSchedule() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      return;
    }

    this.logger.log('KIS Token 스케줄러 시작');

    this.kisKoreanIndexGateway.closeKisConnection();

    await this._tokenRevoke();
    await this._tokenIssue();
    await this.kisKoreanIndexGateway.setKisToken();
    await this.kisKoreanIndexGateway.connectToKis();
    await this.kisKoreanIndexGateway.initKoreanIndex();

    this.logger.log('KIS Token 스케줄러 종료');
  }

  private async _tokenIssue() {
    try {
      const socket = await this.httpService.axiosRef.post<{ approval_key: string }>(
        `${this.URL}/oauth2/Approval`,
        {
          grant_type: 'client_credentials',
          appkey: this.configService.get('KIS_APP_KEY'),
          secretkey: this.configService.get('KIS_APP_SECRET'),
        },
        {
          headers: {
            'content-type': 'application/json; utf-8',
          },
        },
      );

      const oauth = await this.httpService.axiosRef.post<{ access_token: string; access_token_token_expired: string }>(
        `${this.URL}/oauth2/tokenP`,
        {
          grant_type: 'client_credentials',
          appkey: this.configService.get('KIS_APP_KEY'),
          appsecret: this.configService.get('KIS_APP_SECRET'),
        },
      );

      await this.securitiesTokenRepository.save({
        provider: TokenProvider.KIS,
        type: TokenType.SOCKET,
        token: socket.data.approval_key,
        expire: null,
      });

      await this.securitiesTokenRepository.save({
        provider: TokenProvider.KIS,
        type: TokenType.OAUTH,
        token: oauth.data.access_token,
        expire: oauth.data.access_token_token_expired,
      });

      this.logger.log(`스케줄러 KIS Token 갱신 완료`);
    } catch (error) {
      console.error(error);
      this.logger.error('스케줄러 KIS Token 갱신 실패');
    }
  }

  private async _tokenRevoke() {
    const ret = await this.securitiesTokenRepository.findOne({
      where: { provider: TokenProvider.KIS, type: TokenType.OAUTH },
    });

    if (!ret) {
      this.logger.log(`스케줄러 KIS Token 폐기 완료(토큰 없음)`);
      return;
    }

    await this.httpService.axiosRef.post(`${this.URL}/oauth2/revokeP`, {
      token: `Bearer ${ret.token}`,
      appkey: this.configService.get('KIS_APP_KEY'),
      appsecret: this.configService.get('KIS_APP_SECRET'),
    });

    await this.securitiesTokenRepository.delete({
      provider: TokenProvider.KIS,
      type: TokenType.SOCKET,
    });

    await this.securitiesTokenRepository.delete({
      provider: TokenProvider.KIS,
      type: TokenType.OAUTH,
    });

    this.logger.log(`스케줄러 KIS Token 폐기 완료`);
  }
}
