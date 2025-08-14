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
    // await this._deleteKisToken();
    // await this._getKisTokenSchedule();
  }

  @Cron(CronExpression.EVERY_12_HOURS, { name: 'stock Token', timeZone: 'Asia/Seoul' })
  private async _getKisTokenSchedule() {
    // const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    //
    // const ret = await firstValueFrom<AxiosResponse<IKisCreateToken>>(
    //   this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/tokenP`, {
    //     grant_type: 'client_credentials',
    //     appkey: this.configService.get('KIS_APP_KEY'),
    //     appsecret: this.configService.get('KIS_APP_SECRET'),
    //   }),
    // );
    //
    // const { access_token, access_token_token_expired, token_type, expires_in } = ret.data;
    //
    // const isKisToken = await this.kisTokenRepository.findOne({ where: { kisTokenSeq: 1 } });
    //
    // if (isKisToken) {
    //   isKisToken.accessToken = access_token;
    //   isKisToken.accessTokenExpired = access_token_token_expired;
    //   isKisToken.tokenType = token_type;
    //   isKisToken.expiresIn = expires_in;
    //
    //   await this.kisTokenRepository.save(isKisToken);
    // } else {
    //   const token = this.kisTokenRepository.create({
    //     accessToken: access_token,
    //     accessTokenExpired: access_token_token_expired,
    //     tokenType: token_type,
    //     expiresIn: expires_in,
    //   });
    //
    //   await this.kisTokenRepository.save(token);
    // }
    //
    // console.info(`ADMIN SERVER: [${now}] Scheduler 'kis Token' 생성 완료`);
  }

  private async _deleteKisToken() {
    // const kisToken = await this.kisTokenRepository.find();
    //
    // if (!kisToken) {
    //   return;
    // }
    //
    // await firstValueFrom(
    //   this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/revokeP`, {
    //     token: kisToken[0].accessToken,
    //     appkey: this.configService.get('KIS_APP_KEY'),
    //     appsecret: this.configService.get('KIS_APP_SECRET'),
    //   }),
    // );
    //
    // console.info(`ADMIN SERVER: Scheduler 'kis Token' 삭제 완료`);
  }
}
