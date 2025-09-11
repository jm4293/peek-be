import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';

import { TokenProviderEnum, TokenTypeEnum } from '@constant/enum/token';

import { TokenRepository } from '@database/repositories/token';

@Injectable()
export class LsTokenScheduleService implements OnModuleInit {
  private readonly URL = 'https://openapi.ls-sec.co.kr:8080';
  private readonly logger = new Logger(LsTokenScheduleService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly tokenRepository: TokenRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      if (this.configService.get('NODE_ENV') === 'production') {
        await this._deleteLsToken();
        await this._getLsTokenSchedule();
      }
    } catch (error) {
      this.logger.error('스케줄러 LS 토큰값 불러오기 실패');
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS, { name: 'stock Token', timeZone: 'Asia/Seoul' })
  private async _getLsTokenSchedule() {
    try {
      const ret_oauth = await this.httpService.axiosRef.post<{ access_token: string; expires_in: string }>(
        `${this.URL}/oauth2/token`,
        {
          grant_type: 'client_credentials',
          appkey: this.configService.get('LS_APP_KEY'),
          appsecretkey: this.configService.get('LS_APP_SECRET'),
          scope: 'oob',
        },
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );

      await this.tokenRepository.update(
        { provider: TokenProviderEnum.LS, type: TokenTypeEnum.OAUTH },
        { token: ret_oauth.data.access_token, expire: ret_oauth.data.expires_in },
      );

      this.logger.log(`스케줄러 LS Token 갱신 완료`);
    } catch (error) {
      this.logger.error('스케줄러 LS Token 갱신 실패');
    }
  }

  private async _deleteLsToken() {
    const ret = await this.tokenRepository.findOne({
      where: { provider: TokenProviderEnum.LS, type: TokenTypeEnum.OAUTH },
    });

    if (ret) {
      await this.httpService.axiosRef.post(
        `${this.URL}/oauth2/revoke`,
        {
          appkey: this.configService.get('LS_APP_KEY'),
          appsecretkey: this.configService.get('LS_APP_SECRET'),
          token_type_hint: 'access_token',
          token: ret.token,
        },
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );
    }

    this.logger.log(`스케줄러 LS Token 폐기 완료`);
  }
}
