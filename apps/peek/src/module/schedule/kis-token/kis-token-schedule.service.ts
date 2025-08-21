import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { KisTokenRepository } from '@database/repositories/kis';

@Injectable()
export class KisTokenScheduleService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly kisTokenRepository: KisTokenRepository,
  ) {}

  async onModuleInit() {
    try {
      await this._deleteKisToken();
      await this._getKisTokenSchedule();
    } catch (error) {
      console.error('KisTokenScheduleService onModuleInit 에러:', error);
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS, { name: 'stock Token', timeZone: 'Asia/Seoul' })
  private async _getKisTokenSchedule() {
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    const ret = await firstValueFrom<AxiosResponse<{ approval_key: string }>>(
      this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/Approval`, {
        grant_type: 'client_credentials',
        appkey: this.configService.get('KIS_APP_KEY'),
        secretkey: this.configService.get('KIS_APP_SECRET'),
      }),
    );

    const { approval_key } = ret.data;

    const isKisToken = await this.kisTokenRepository.findOne({ where: { id: 1 } });

    if (isKisToken) {
      isKisToken.token = approval_key;
      isKisToken.tokenExpired = null;
      isKisToken.tokenType = null;
      isKisToken.expiresIn = null;

      await this.kisTokenRepository.save(isKisToken);
    } else {
      const token = this.kisTokenRepository.create({
        token: approval_key,
        tokenExpired: null,
        tokenType: null,
        expiresIn: null,
      });

      await this.kisTokenRepository.save(token);
    }

    console.info(`ADMIN SERVER: [${now}] Scheduler 'kis Token' 생성 완료`);
  }

  private async _deleteKisToken() {
    const kisToken = await this.kisTokenRepository.findOne({ where: { id: 1 } });

    if (!kisToken) {
      return;
    }

    await firstValueFrom(
      this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/revokeP`, {
        token: kisToken.token,
        appkey: this.configService.get('KIS_APP_KEY'),
        appsecret: this.configService.get('KIS_APP_SECRET'),
      }),
    );

    console.info(`ADMIN SERVER: Scheduler 'kis Token' 삭제 완료`);
  }
}
