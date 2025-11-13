// export enum StockCategoryEnum {
//   KOSPI = 1,
//   KOSDAQ = 2,
// }

export const StockCategory = {
  KOSPI: 1,
  KOSDAQ: 2,
} as const;

export type StockCategoryKey = keyof typeof StockCategory;
export type StockCategoryValue = (typeof StockCategory)[keyof typeof StockCategory];
