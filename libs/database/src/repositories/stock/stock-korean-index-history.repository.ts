import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { StockKoreanIndexHistory } from '@libs/database/entities/stock';

@Injectable()
export class StockKoreanIndexHistoryRepository extends Repository<StockKoreanIndexHistory> {
  constructor(manager: EntityManager) {
    super(StockKoreanIndexHistory, manager);
  }

  /**
   * 특정 종목의 1분 캔들 데이터를 생성합니다.
   * @param code 종목 코드 (upcode 필드 사용)
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 1분 캔들 데이터 배열
   */
  async getCandleData(code: string, startDate: Date, endDate: Date) {
    const query = this.createQueryBuilder('stock')
      .where('stock.upcode = :code', { code })
      .andWhere('stock.createdAt >= :startDate', { startDate })
      .andWhere('stock.createdAt <= :endDate', { endDate })
      .orderBy('stock.createdAt', 'ASC');

    const data = await query.getMany();

    return this.groupByMinute(data);
  }

  /**
   * 실시간 데이터를 1분 단위로 그룹화하여 캔들 데이터를 생성합니다.
   * @param data 실시간 데이터 배열
   * @returns 1분 캔들 데이터 배열
   */
  private groupByMinute(data: StockKoreanIndexHistory[]) {
    const candleMap = new Map<
      string,
      {
        open: number;
        high: number;
        low: number;
        close: number;
        time: number;
      }
    >();

    data.forEach((item) => {
      const minuteTimestamp = new Date(item.createdAt);
      minuteTimestamp.setSeconds(0, 0);
      const minuteKey = minuteTimestamp.toISOString();
      const unixTime = Math.floor(minuteTimestamp.getTime() / 1000);

      const currentPrice = +item.jisu || 0;

      if (!candleMap.has(minuteKey)) {
        candleMap.set(minuteKey, {
          open: currentPrice,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
          time: unixTime,
        });
      } else {
        const candle = candleMap.get(minuteKey)!;
        candle.high = Math.max(candle.high, currentPrice);
        candle.low = Math.min(candle.low, currentPrice);
        candle.close = currentPrice;
      }
    });

    return Array.from(candleMap.values()).sort((a, b) => a.time - b.time);
  }

  /**
   * 특정 종목의 최신 실시간 데이터를 조회합니다.
   * @param code 종목 코드 (upcode 필드 사용)
   * @param limit 조회할 개수
   * @returns 최신 실시간 데이터 배열
   */
  async getLatestData(code: string, limit: number = 100) {
    return this.createQueryBuilder('stock')
      .where('stock.upcode = :code', { code })
      .orderBy('stock.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}
