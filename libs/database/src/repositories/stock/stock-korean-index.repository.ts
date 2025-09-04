import { EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { StockKoreanIndex } from '@database/entities/stock';

@Injectable()
export class StockKoreanIndexRepository extends Repository<StockKoreanIndex> {
  constructor(manager: EntityManager) {
    super(StockKoreanIndex, manager);
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

    // 1분 단위로 그룹화하여 캔들 데이터 생성
    return this.groupByMinute(data);
  }

  /**
   * 실시간 데이터를 1분 단위로 그룹화하여 캔들 데이터를 생성합니다.
   * @param data 실시간 데이터 배열
   * @returns 1분 캔들 데이터 배열
   */
  private groupByMinute(data: StockKoreanIndex[]) {
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
      // 1분 단위로 그룹화 (초 단위를 0으로 설정)
      const minuteTimestamp = new Date(item.createdAt);
      minuteTimestamp.setSeconds(0, 0);
      const minuteKey = minuteTimestamp.toISOString();

      // jisu 필드를 숫자로 변환 (현재가)
      const currentPrice = parseFloat(item.jisu) || 0;
      // Unix timestamp로 변환
      const unixTime = Math.floor(minuteTimestamp.getTime() / 1000);

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
        candle.close = currentPrice; // 마지막 가격이 종가
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
