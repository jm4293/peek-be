// export enum TokenProviderEnum {
//   KIS = 1,
//   LS = 2,
//   KIWOOM = 3,
// }

export const TokenProvider = {
  KIS: 1,
  LS: 2,
  KIWOOM: 3,
} as const;

export type TokenProviderKey = keyof typeof TokenProvider;
export type TokenProviderValue = (typeof TokenProvider)[keyof typeof TokenProvider];
