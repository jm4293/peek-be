// export enum StockKoreanIndexTypeEnum {
//   KOSPI = 1,
//   KOSDAQ = 2,
// }

export const StockKoreanIndexType = {
  KOSPI: 1,
  KOSDAQ: 2,
} as const;

export type StockKoreanIndexTypeKey = keyof typeof StockKoreanIndexType;
export type StockKoreanIndexTypeValue = (typeof StockKoreanIndexType)[keyof typeof StockKoreanIndexType];
