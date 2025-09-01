import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';

import { TokenProviderEnum, TokenTypeEnum } from '@constant/enum/token';

import { Token } from '@database/entities/token';
import { TokenRepository } from '@database/repositories/token';

@Injectable()
export class KiwoomTokenScheduleService implements OnModuleInit {
  private KiwoomURL = '	https://api.kiwoom.com';
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
        await this._deleteKiwoomToken();
        await this._getKiwoomTokenSchedule();
      }
    } catch (error) {
      console.log('error', error);
      this.logger.error('Kiwoom TokenScheduleService onModuleInit 에러:');
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS, { name: 'stock Token', timeZone: 'Asia/Seoul' })
  private async _getKiwoomTokenSchedule() {
    const ret_oauth = await firstValueFrom<AxiosResponse<{ token: string; expires_dt: string }>>(
      this.httpService.post(
        `${this.KiwoomURL}/oauth2/token`,
        {
          grant_type: 'client_credentials',
          appkey: this.configService.get('KIWOOM_APP_KEY'),
          secretkey: this.configService.get('KIWOOM_APP_SECRET'),
        },
        {
          headers: {
            'content-type': 'application/json;charset=UTF-8',
          },
        },
      ),
    );

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Token).delete({ provider: TokenProviderEnum.KIWOOM, type: TokenTypeEnum.OAUTH });

      const oauth = manager.getRepository(Token).create({
        provider: TokenProviderEnum.KIWOOM,
        token: ret_oauth.data.token,
        expire: String(ret_oauth.data.expires_dt),
        type: TokenTypeEnum.OAUTH,
      });

      await manager.getRepository(Token).save(oauth);
    });

    this.logger.log(`KIWOOM Token 갱신 완료`);
  }

  private async _deleteKiwoomToken() {
    const oauth = await this.tokenRepository.findOne({
      where: { provider: TokenProviderEnum.KIWOOM, type: TokenTypeEnum.OAUTH },
    });

    if (oauth) {
      await firstValueFrom(
        this.httpService.post(`${this.KiwoomURL}/oauth2/revoke`, {
          appkey: this.configService.get('KIWOOM_APP_KEY'),
          secretkey: this.configService.get('KIWOOM_APP_SECRET'),
          token: oauth.token,
        }),
      );
    }

    this.logger.log(`KIWOOM Token 삭제 완료`);
  }
}
