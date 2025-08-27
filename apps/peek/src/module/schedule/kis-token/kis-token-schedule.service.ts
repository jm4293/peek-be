import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';

import { KisTokenType } from '@constant/enum/kis';

import { KisToken } from '@database/entities/kis';
import { KisTokenRepository } from '@database/repositories/kis';

@Injectable()
export class KisTokenScheduleService implements OnModuleInit {
  private readonly logger = new Logger(KisTokenScheduleService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly kisTokenRepository: KisTokenRepository,

    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      if (this.configService.get('NODE_ENV') === 'production') {
        await this._deleteKisToken();
        await this._getKisTokenSchedule();
      }
    } catch (error) {
      this.logger.error('KisTokenScheduleService onModuleInit 에러:', error);
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS, { name: 'stock Token', timeZone: 'Asia/Seoul' })
  private async _getKisTokenSchedule() {
    // const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    const ret_socket = await firstValueFrom<AxiosResponse<{ approval_key: string }>>(
      this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/Approval`, {
        grant_type: 'client_credentials',
        appkey: this.configService.get('KIS_APP_KEY'),
        secretkey: this.configService.get('KIS_APP_SECRET'),
      }),
    );

    const ret_oauth = await firstValueFrom<AxiosResponse<{ access_token: string; access_token_token_expired: string }>>(
      this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/tokenP`, {
        grant_type: 'client_credentials',
        appkey: this.configService.get('KIS_APP_KEY'),
        appsecret: this.configService.get('KIS_APP_SECRET'),
      }),
    );

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(KisToken).delete({ tokenType: KisTokenType.SOCKET });
      await manager.getRepository(KisToken).delete({ tokenType: KisTokenType.OAUTH });

      const socket = manager.getRepository(KisToken).create({
        token: ret_socket.data.approval_key,
        tokenExpired: null,
        tokenType: KisTokenType.SOCKET,
        expiresIn: null,
      });

      const oauth = manager.getRepository(KisToken).create({
        token: ret_oauth.data.access_token,
        tokenExpired: ret_oauth.data.access_token_token_expired,
        tokenType: KisTokenType.OAUTH,
        expiresIn: null,
      });

      await manager.getRepository(KisToken).save(socket);
      await manager.getRepository(KisToken).save(oauth);
    });
  }

  private async _deleteKisToken() {
    const socket = await this.kisTokenRepository.findOne({ where: { tokenType: KisTokenType.SOCKET } });
    const oauth = await this.kisTokenRepository.findOne({ where: { tokenType: KisTokenType.OAUTH } });

    if (socket) {
      await firstValueFrom(
        this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/revokeP`, {
          token: socket.token,
          appkey: this.configService.get('KIS_APP_KEY'),
          appsecret: this.configService.get('KIS_APP_SECRET'),
        }),
      );
    }

    if (oauth) {
      await firstValueFrom(
        this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/revokeP`, {
          token: oauth.token,
          appkey: this.configService.get('KIS_APP_KEY'),
          appsecret: this.configService.get('KIS_APP_SECRET'),
        }),
      );
    }

    this.logger.log(`KIS Token 삭제 완료`);
  }
}
