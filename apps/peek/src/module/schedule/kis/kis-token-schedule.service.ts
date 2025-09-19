import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';

import { TokenProviderEnum, TokenTypeEnum } from '@constant/enum/token';

import { TokenRepository } from '@database/repositories/token';

@Injectable()
export class KisTokenScheduleService implements OnModuleInit {
  private readonly URL = 'https://openapi.koreainvestment.com:9443';
  private readonly logger = new Logger(KisTokenScheduleService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly tokenRepository: TokenRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      if (this.configService.get('NODE_ENV') === 'production') {
        // await this._deleteKisToken();
        await this._getKisTokenSchedule();
      }
    } catch (error) {
      this.logger.error('스케줄러 KIS 토큰값 불러오기 실패');
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS, { name: 'stock Token', timeZone: 'Asia/Seoul' })
  private async _getKisTokenSchedule() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      return;
    }

    try {
      const ret_socket = await this.httpService.axiosRef.post<{ approval_key: string }>(`${this.URL}/oauth2/Approval`, {
        grant_type: 'client_credentials',
        appkey: this.configService.get('KIS_APP_KEY'),
        secretkey: this.configService.get('KIS_APP_SECRET'),
      });

      await this.tokenRepository.update(
        { provider: TokenProviderEnum.KIS, type: TokenTypeEnum.SOCKET },
        { token: ret_socket.data.approval_key },
      );

      this.logger.log(`스케줄러 KIS Token 갱신 완료`);
    } catch (error) {
      this.logger.error('스케줄러 KIS Token 갱신 실패');
    }
  }

  private async _deleteKisToken() {
    const ret = await this.tokenRepository.findOne({
      where: { provider: TokenProviderEnum.KIS, type: TokenTypeEnum.OAUTH },
    });

    if (ret) {
      await this.httpService.axiosRef.post(`${this.URL}/oauth2/revokeP`, {
        token: `Bearer ${ret.token}`,
        appkey: this.configService.get('KIS_APP_KEY'),
        appsecret: this.configService.get('KIS_APP_SECRET'),
      });
    }

    this.logger.log(`스케줄러 KIS Token 폐기 완료`);
  }
}
