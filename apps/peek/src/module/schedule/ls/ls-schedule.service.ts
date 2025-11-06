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
export class LsScheduleService implements OnModuleInit {
  private readonly logger = new Logger(LsScheduleService.name);

  private socketToken: string | null = null;
  private oauthToken: string | null = null;

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

    this._setLsToken();
  }

  @Cron('0 8 * * *', { name: 'ls stock Token', timeZone: 'Asia/Seoul' })
  private async GetLsTokenSchedule() {
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

    this._setLsToken();

    this.logger.log('LS Token 스케줄러 종료');
  }

  @Cron('*/10 * 22-23 * * *', { name: 'ls us index night', timeZone: 'Asia/Seoul' })
  private async LsUsIndexScheduleNight() {
    // this._getUsIndex();
  }

  @Cron('*/10 * 0-6 * * *', { name: 'ls us index morning', timeZone: 'Asia/Seoul' })
  private async LsUsIndexScheduleMorning() {
    // this._getUsIndex();
  }

  private async _tokenIssue() {
    try {
      const token = await this.httpService.axiosRef.post<{ access_token: string; expires_in: number }>(
        'https://openapi.ls-sec.co.kr:8080/oauth2/token',
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
      'https://openapi.ls-sec.co.kr:8080/oauth2/revoke',
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

  private async _setLsToken() {
    const socketRet = await this.securitiesTokenRepository.findOne({
      where: { provider: TokenProviderEnum.LS, type: TokenTypeEnum.SOCKET },
    });

    if (socketRet) {
      this.socketToken = socketRet.token;
    }

    const oauthRet = await this.securitiesTokenRepository.findOne({
      where: { provider: TokenProviderEnum.LS, type: TokenTypeEnum.OAUTH },
    });

    if (oauthRet) {
      this.oauthToken = oauthRet.token;
    }
  }

  private async _getUsIndex() {
    const response = await this.httpService.axiosRef.post(
      'https://openapi.ls-sec.co.kr:8080/stock/investinfo',
      {
        t3518InBlock: {
          kind: 'S',
          symbol: 'NAS@IXIC',
          cnt: 1,
          jgbn: '3',
          nmin: 1,
          cts_date: ' ',
          cts_time: ' ',
        },
      },
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          authorization: `Bearer ${this.oauthToken}`,
          tr_cd: 't3518',
          tr_cont: 'N',
          tr_cont_key: '',
          mac_address: '',
        },
      },
    );

    if (response.status !== 200) {
      this.logger.error(`LS US Index 조회 실패: API 응답 상태 코드 ${response.status}`);
      return;
    }

    console.log('LS US Index Data:', response.data);
  }
}
