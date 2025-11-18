import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';

import { SecuritiesTokenRepository } from '@libs/database/repositories/stock';

import { TokenProvider, TokenType } from '@libs/shared/const/token';

@Injectable()
export class KiwoomTokenScheduleService implements OnModuleInit {
  private readonly URL = 'https://api.kiwoom.com';
  private readonly logger = new Logger(KiwoomTokenScheduleService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly securitiesTokenRepository: SecuritiesTokenRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // await this._tokenRevoke();
    // await this._tokenIssue();
  }

  @Cron('0 8 * * *', { name: 'stock Token', timeZone: 'Asia/Seoul' })
  private async _getKiwoomTokenSchedule() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      return;
    }

    // await this._tokenRevoke();
    // await this._tokenIssue();
  }

  private async _tokenIssue() {
    try {
      const socket = await this.httpService.axiosRef.post<{ token: string; expires_dt: string }>(
        `${this.URL}/oauth2/token`,
        {
          grant_type: 'client_credentials',
          appkey: this.configService.get('KIWOOM_APP_KEY'),
          secretkey: this.configService.get('KIWOOM_APP_SECRET'),
        },
      );

      const oauth = await this.httpService.axiosRef.post<{ token: string; expires_dt: string }>(
        `${this.URL}/oauth2/token`,
        {
          grant_type: 'client_credentials',
          appkey: this.configService.get('KIWOOM_APP_KEY'),
          secretkey: this.configService.get('KIWOOM_APP_SECRET'),
        },
      );

      await this.securitiesTokenRepository.upsert(
        {
          provider: TokenProvider.KIWOOM,
          type: TokenType.SOCKET,
          token: socket.data.token,
          expire: socket.data.expires_dt,
        },
        {
          conflictPaths: ['provider', 'type'],
          skipUpdateIfNoValuesChanged: true,
        },
      );

      await this.securitiesTokenRepository.upsert(
        {
          provider: TokenProvider.KIWOOM,
          type: TokenType.OAUTH,
          token: socket.data.token,
          expire: socket.data.expires_dt,
        },
        {
          conflictPaths: ['provider', 'type'],
          skipUpdateIfNoValuesChanged: true,
        },
      );

      this.logger.log(`스케줄러 KIWOOM Token 갱신 완료`);
    } catch (error) {
      this.logger.error('스케줄러 KIWOOM Token 갱신 실패');
    }
  }

  private async _tokenRevoke() {
    const ret = await this.securitiesTokenRepository.findOne({
      where: { provider: TokenProvider.KIWOOM, type: TokenType.OAUTH },
    });

    if (!ret) {
      this.logger.log(`스케줄러 KIWOOM Token 폐기 완료(토큰 없음)`);
      return;
    }

    await this.httpService.axiosRef.post(`${this.URL}/oauth2/revoke`, {
      token: ret.token,
      appkey: this.configService.get('KIWOOM_APP_KEY'),
      secretkey: this.configService.get('KIWOOM_APP_SECRET'),
    });

    this.logger.log(`스케줄러 KIWOOM Token 폐기 완료`);
  }
}
