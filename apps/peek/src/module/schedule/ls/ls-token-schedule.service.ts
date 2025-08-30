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
export class LsTokenScheduleService implements OnModuleInit {
  private lsURL = 'https://openapi.ls-sec.co.kr:8080';
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
      console.log('error', error);
      this.logger.error('LS TokenScheduleService onModuleInit 에러:');
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS, { name: 'stock Token', timeZone: 'Asia/Seoul' })
  private async _getLsTokenSchedule() {
    const ret_oauth = await firstValueFrom<AxiosResponse<{ access_token: string; expires_in: number }>>(
      this.httpService.post(
        `${this.lsURL}/oauth2/token`,
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
      ),
    );

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Token).delete({ provider: TokenProviderEnum.LS, type: TokenTypeEnum.OAUTH });

      const oauth = manager.getRepository(Token).create({
        provider: TokenProviderEnum.LS,
        token: ret_oauth.data.access_token,
        expire: String(ret_oauth.data.expires_in),
        type: TokenTypeEnum.OAUTH,
      });

      await manager.getRepository(Token).save(oauth);
    });
  }

  private async _deleteLsToken() {
    const oauth = await this.tokenRepository.findOne({
      where: { provider: TokenProviderEnum.LS, type: TokenTypeEnum.OAUTH },
    });

    console.log('1', this.configService.get('LS_APP_KEY'));
    console.log('2', this.configService.get('LS_APP_SECRET'));

    if (oauth) {
      await firstValueFrom(
        this.httpService.post(`${this.lsURL}/oauth2/revoke`, {
          appkey: this.configService.get('LS_APP_KEY'),
          appsecretkey: this.configService.get('LS_APP_SECRET'),
          token_type_hint: 'access_token',
          token: oauth.token,
        }),
      );
    }

    this.logger.log(`KIS Token 삭제 완료`);
  }
}
