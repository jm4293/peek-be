import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CurrencyUnitEnum } from '@constant/enum/currnecy';

import { CurrencyHistoryRepository } from '@database/repositories/currency';

@Injectable()
export class CurrencyService implements OnModuleInit {
  private readonly URL = 'https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON';
  private readonly logger = new Logger(CurrencyService.name);
  private appKey: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly currencyHistoryRepository: CurrencyHistoryRepository,
  ) {
    this.appKey = this.configService.get('OPEN_API_KOREA_EXIM');
  }

  async onModuleInit() {
    console.log('121212', this.appKey);
    this._getCurrencySchedule();
  }

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'currency', timeZone: 'Asia/Seoul' })
  private async _getCurrencySchedule() {
    try {
      const ret = await this.httpService.axiosRef.get<{ cur_unit: string; deal_bas_r: string; cur_nm: string }[]>(
        `${this.URL}`,
        {
          params: {
            authkey: this.appKey,
            data: 'AP01',
          },
        },
      );

      const { data } = ret;

      const currencyUnits = Object.values(CurrencyUnitEnum).filter((currency) => typeof currency === 'string');

      const filtered = data.reduce((acc, cur) => {
        const currency = currencyUnits.find((currency) => cur.cur_unit.startsWith(currency));

        if (currency) {
          acc.push({ ...cur, curUnit: currency, curUnitDesc: cur.cur_unit });
        }

        return acc;
      }, []);

      filtered.forEach(async (el) => {
        await this.currencyHistoryRepository.save({
          curUnit: el.curUnit,
          curUnitDesc: el.curUnitDesc,
          curNm: el.cur_nm,
          standard: el.deal_bas_r,
        });
      });
    } catch (error) {
      this.logger.error('CurrencyService _getCurrencySchedule 에러:');
      throw error;
    }
  }
}
