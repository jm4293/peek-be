import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';

import { LsKoreanIndexGateway } from '@peek/module/websocket';

import { TokenProviderEnum, TokenTypeEnum } from '@constant/enum/token';

import { SecuritiesTokenRepository } from '@database/repositories/stock';

@Injectable()
export class LsTokenScheduleService implements OnModuleInit {
  private readonly URL = 'https://openapi.ls-sec.co.kr:8080';
  private readonly logger = new Logger(LsTokenScheduleService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly securitiesTokenRepository: SecuritiesTokenRepository,

    private readonly lsKoreanIndexGateway: LsKoreanIndexGateway,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.lsKoreanIndexGateway.closeLsConnection();

    // await this._tokenRevoke();
    // await this._tokenIssue();
    await this.lsKoreanIndexGateway.setLsToken();
    await this.lsKoreanIndexGateway.connectToLs();
    await this.lsKoreanIndexGateway.initKoreanIndex();
  }

  @Cron('0 8 * * *', { name: 'ls stock Token', timeZone: 'Asia/Seoul' })
  private async _getLsTokenSchedule() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      return;
    }

    this.logger.log('LS Token 스케줄러 시작');

    this.lsKoreanIndexGateway.closeLsConnection();

    await this._tokenRevoke();
    await this._tokenIssue();
    await this.lsKoreanIndexGateway.setLsToken();
    await this.lsKoreanIndexGateway.connectToLs();
    await this.lsKoreanIndexGateway.initKoreanIndex();

    this.logger.log('LS Token 스케줄러 종료');
  }

  private async _tokenIssue() {
    try {
      const token = await this.httpService.axiosRef.post<{ access_token: string; expires_in: number }>(
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

      if (token.status !== 200) {
        this.logger.error('스케줄러 LS Token 갱신 실패');
        return;
      }

      // await this.securitiesTokenRepository.upsert(
      //   {
      //     provider: TokenProviderEnum.LS,
      //     type: TokenTypeEnum.SOCKET,
      //     token: token.data.access_token,
      //     expire: String(token.data.expires_in),
      //   },
      //   {
      //     conflictPaths: ['provider', 'type'],
      //     skipUpdateIfNoValuesChanged: true,
      //   },
      // );

      // await this.securitiesTokenRepository.upsert(
      //   {
      //     provider: TokenProviderEnum.LS,
      //     type: TokenTypeEnum.OAUTH,
      //     token: token.data.access_token,
      //     expire: String(token.data.expires_in),
      //   },
      //   {
      //     conflictPaths: ['provider', 'type'],
      //     skipUpdateIfNoValuesChanged: true,
      //   },
      // );

      await this.securitiesTokenRepository.save({
        provider: TokenProviderEnum.LS,
        type: TokenTypeEnum.SOCKET,
        token: token.data.access_token,
        expire: String(token.data.expires_in),
      });

      await this.securitiesTokenRepository.save({
        provider: TokenProviderEnum.LS,
        type: TokenTypeEnum.OAUTH,
        token: token.data.access_token,
        expire: String(token.data.expires_in),
      });

      this.logger.log(`스케줄러 LS Token 갱신 완료`);
    } catch (error) {
      console.error(error);
      this.logger.error('스케줄러 LS Token 갱신 실패');
    }
  }

  private async _tokenRevoke() {
    const ret = await this.securitiesTokenRepository.findOne({
      where: { provider: TokenProviderEnum.LS, type: TokenTypeEnum.OAUTH },
    });

    if (!ret) {
      this.logger.log(`스케줄러 LS Token 폐기 완료(토큰 없음)`);
      return;
    }

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

    await this.securitiesTokenRepository.delete({
      provider: TokenProviderEnum.LS,
      type: TokenTypeEnum.SOCKET,
    });

    await this.securitiesTokenRepository.delete({
      provider: TokenProviderEnum.LS,
      type: TokenTypeEnum.OAUTH,
    });

    this.logger.log(`스케줄러 LS Token 폐기 완료`);
  }
}
