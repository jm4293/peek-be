// export enum StockRankEnum {
//   MARKET_CAP_TOP = 't1444', // 시가총액상위
//   VOLUME_TOP = 't1452', // 거래량상위
//   TRADING_VALUE_TOP = 't1463', // 거래대금상위
//   TRADING_SURGE = 't1466', // 전일동시간대비거래급증
// }

export const StockRank = {
  MARKET_CAP_TOP: 't1444', // 시가총액상위
  VOLUME_TOP: 't1452', // 거래량상위
  TRADING_VALUE_TOP: 't1463', // 거래대금상위
  TRADING_SURGE: 't1466', // 전일동시간대비거래급증
} as const;

export type StockRankKey = keyof typeof StockRank;
export type StockRankValue = (typeof StockRank)[keyof typeof StockRank];
