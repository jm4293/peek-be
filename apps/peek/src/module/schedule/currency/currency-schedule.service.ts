import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

import { CurrencyHistoryRepository } from '@libs/database/repositories/currency';

import { CurrencyUnit, CurrencyUnitValue } from '@libs/shared/const/currency';

interface IResponse {
  result: number; // 조회 결과, 1 : 성공, 2 : DATA코드 오류, 3 : 인증코드 오류, 4 : 일일제한횟수 마감
  cur_unit: string; // 통화코드
  cur_nm: string; // 국가/통화명
  cur_unit_desc: string;
  ttb: string; // 전신환(송금) 받으실때, 은행이 송금을 받을 때 적용되는 매입 환율
  tts: string; // 전신환(송금) 보내실때, 은행이 송금을 보낼 때 적용되는 매도 환율
  deal_bas_r: string; // 매매 기준율, 은행의 거래 기준으로 삼는 환율
  bkpr: string; // 장부가격, 회계상 사용되는 환율로, 대부분 ‘매매기준율’과 같음
  yy_efee_r: string; // 년환가료율, 연 단위 환가와 관련된 수수료율
  ten_dd_efee_r: string; // 10일환가료율, 10일 단위 환가 수수료율
  kftc_deal_bas_r: string; // 서울외국환중개 매매기준율, 한국금융결제원의 기준 환율
  kftc_bkpr: string; // 서울외국환중개 장부가격, 결제원의 공식 회계 환율
}

@Injectable()
export class CurrencyScheduleService {
  private readonly logger = new Logger(CurrencyScheduleService.name);

  private appKey: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly currencyHistoryRepository: CurrencyHistoryRepository,
  ) {
    this.appKey = this.configService.get('OPEN_API_KOREA_EXIM');
  }

  @Cron('*/30 * 12-19 * * *', { name: 'currency', timeZone: 'Asia/Seoul' })
  private async CurrencySchedule() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      return;
    }

    if (!this.appKey) {
      this.logger.error('환율 스케줄러 실행 실패: OPEN_API_KOREA_EXIM 키가 설정되지 않음');
      return;
    }

    try {
      const response = await this.httpService.axiosRef.get<Omit<IResponse, 'cur_unit_desc'>[]>(
        'https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON',
        {
          params: {
            authkey: this.appKey,
            data: 'AP01',
          },
        },
      );

      if (response.status !== 200) {
        this.logger.error(`환율 스케줄러 실행 실패: API 응답 상태 코드 ${response.status}`);
        return;
      }

      const { data } = response;

      const filtered = Object.values(CurrencyUnit).reduce<IResponse[]>((acc, cur) => {
        const currencyUnit = data.find((item) => item.cur_unit.startsWith(cur));

        if (!currencyUnit) {
          return acc;
        }

        if (currencyUnit.result !== 1) {
          return acc;
        }

        acc.push({ ...currencyUnit, cur_unit: cur, cur_unit_desc: currencyUnit.cur_unit });

        return acc;
      }, []);

      const saveResults = await Promise.allSettled(
        filtered.map(async (el) => {
          return this.currencyHistoryRepository.save({
            curUnit: el.cur_unit as CurrencyUnitValue,
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
        failedSaves.forEach((result, index) => {
          this.logger.error(`환율 저장 오류 발생: ${index}번째 항목`, (result as PromiseRejectedResult).reason);
        });
      }

      this.logger.log(
        `환율 처리 완료: 총 ${filtered.length}개 통화 중 ${saveResults.length - failedSaves.length}개 저장 성공`,
      );
    } catch (error) {
      this.logger.error('환율 스케줄러 실행 중 오류 발생:', error);
    }
  }
}
