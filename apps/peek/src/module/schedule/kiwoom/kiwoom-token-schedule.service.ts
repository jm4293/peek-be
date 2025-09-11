import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';

import { TokenProviderEnum, TokenTypeEnum } from '@constant/enum/token';

import { TokenRepository } from '@database/repositories/token';

@Injectable()
export class KiwoomTokenScheduleService implements OnModuleInit {
  private readonly URL = 'https://api.kiwoom.com';
  private readonly logger = new Logger(KiwoomTokenScheduleService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly tokenRepository: TokenRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      if (this.configService.get('NODE_ENV') === 'production') {
        // await this._deleteKiwoomToken();
        await this._getKiwoomTokenSchedule();
      }
    } catch (error) {
      this.logger.error('스케줄러 KIWOOM 토큰값 불러오기 실패');
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS, { name: 'stock Token', timeZone: 'Asia/Seoul' })
  private async _getKiwoomTokenSchedule() {
    try {
      const ret_oauth = await this.httpService.axiosRef.post<{ token: string; expires_dt: string }>(
        `${this.URL}/oauth2/token`,
        {
          grant_type: 'client_credentials',
          appkey: this.configService.get('KIWOOM_APP_KEY'),
          secretkey: this.configService.get('KIWOOM_APP_SECRET'),
        },
      );

      await this.tokenRepository.update(
        { provider: TokenProviderEnum.KIWOOM, type: TokenTypeEnum.OAUTH },
        { token: ret_oauth.data.token, expire: ret_oauth.data.expires_dt },
      );

      this.logger.log(`스케줄러 KIWOOM Token 갱신 완료`);
    } catch (error) {
      this.logger.error('스케줄러 KIWOOM Token 갱신 실패');
    }
  }

  private async _deleteKiwoomToken() {
    const ret = await this.tokenRepository.findOne({
      where: { provider: TokenProviderEnum.KIWOOM, type: TokenTypeEnum.OAUTH },
    });

    if (ret) {
      await this.httpService.axiosRef.post(`${this.URL}/oauth2/revoke`, {
        token: ret.token,
        appkey: this.configService.get('KIWOOM_APP_KEY'),
        secretkey: this.configService.get('KIWOOM_APP_SECRET'),
      });
    }

    this.logger.log(`스케줄러 KIWOOM Token 폐기 완료`);
  }
}
