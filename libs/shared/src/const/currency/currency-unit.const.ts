// export enum CurrencyUnitEnum {
//   USD = 'USD',
//   EUR = 'EUR',
//   JPY = 'JPY',
//   CNH = 'CNH',
//   AUD = 'AUD',
//   GBP = 'GBP',
// }

export const CurrencyUnit = {
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
  CNH: 'CNH',
  AUD: 'AUD',
  GBP: 'GBP',
} as const;

export type CurrencyUnitKey = keyof typeof CurrencyUnit;
export type CurrencyUnitValue = (typeof CurrencyUnit)[keyof typeof CurrencyUnit];
