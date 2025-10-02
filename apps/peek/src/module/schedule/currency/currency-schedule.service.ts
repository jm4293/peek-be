import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CurrencyUnitEnum } from '@constant/enum/currency';

import { CurrencyHistoryRepository } from '@database/repositories/currency';

interface IResponse {
  result: number; // 조회 결과, 1 : 성공, 2 : DATA코드 오류, 3 : 인증코드 오류, 4 : 일일제한횟수 마감
  cur_unit: string; // 통화코드
  cur_nm: string; // 국가/통화명
  cur_unit_desc: string;
  ttb: string; // 전신환(송금) 받으실때
  tts: string; // 전신환(송금) 보내실때
  deal_bas_r: string; // 매매 기준율
  bkpr: string; // 장부가격
  yy_efee_r: string; // 년환가료율
  ten_dd_efee_r: string; // 10일환가료율
  kftc_deal_bas_r: string; // 서울외국환중개 매매기준율
  kftc_bkpr: string; // 서울외국환중개 장부가격
}

@Injectable()
export class CurrencyScheduleService {
  private readonly URL = 'https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON';
  private readonly logger = new Logger(CurrencyScheduleService.name);
  private appKey: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly currencyHistoryRepository: CurrencyHistoryRepository,
  ) {
    this.appKey = this.configService.get('OPEN_API_KOREA_EXIM');
  }

  // async onModuleInit() {
  //   if (this.configService.get('NODE_ENV') === 'production') {
  //     this._getCurrencySchedule();
  //   }
  // }

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'currency', timeZone: 'Asia/Seoul' })
  private async _getCurrencySchedule() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      return;
    }

    if (!this.appKey) {
      this.logger.error('CurrencyService _getCurrencySchedule: appKey is null');
      return;
    }

    try {
      const ret = await this.httpService.axiosRef.get<Omit<IResponse, 'cur_unit_desc'>[]>(`${this.URL}`, {
        params: {
          authkey: this.appKey,
          data: 'AP01',
        },
      });

      const { data } = ret;

      if (!Array.isArray(data)) {
        this.logger.warn('Invalid response format: data is not an array');
        return;
      }

      const validCurrencyUnits = Object.values(CurrencyUnitEnum);

      const filtered = data.reduce((acc, cur) => {
        if (cur.result !== 1) {
          return acc;
        }

        const validCurrency = validCurrencyUnits.find((currency) => cur.cur_unit.startsWith(currency));

        if (!validCurrency) {
          return acc;
        }

        acc.push({ ...cur, cur_unit: validCurrency, cur_unit_desc: cur.cur_unit });

        return acc;
      }, [] as IResponse[]);

      const saveResults = await Promise.allSettled(
        filtered.map(async (el) => {
          return this.currencyHistoryRepository.save({
            curUnit: el.cur_unit as CurrencyUnitEnum,
            curNm: el.cur_nm,
            curUnitDesc: el.cur_unit_desc,
            ttb: el.ttb,
            tts: el.tts,
            dealBasR: el.deal_bas_r,
            bkpr: el.bkpr,
            yyEfeeR: el.yy_efee_r,
            tenDdEfeeR: el.ten_dd_efee_r,
            kftcDealBasR: el.kftc_deal_bas_r,
            kftcBkpr: el.kftc_bkpr,
          });
        }),
      );

      const failedSaves = saveResults.filter((result) => result.status === 'rejected');

      if (failedSaves.length > 0) {
        this.logger.warn(`Failed to save ${failedSaves.length} currency records`);
        failedSaves.forEach((result, index) => {
          this.logger.error(`Currency save error for item ${index}:`, (result as PromiseRejectedResult).reason);
        });
      }

      this.logger.log(
        `환율 처리 완료: 총 ${filtered.length}개 통화 중 ${saveResults.length - failedSaves.length}개 저장 성공`,
      );
    } catch (error) {
      this.logger.error('Error in currency schedule:', error);
    }
  }
}
