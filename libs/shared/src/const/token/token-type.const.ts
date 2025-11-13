// export enum TokenTypeEnum {
//   SOCKET = 1,
//   OAUTH = 2,
// }

export const TokenType = {
  SOCKET: 1,
  OAUTH: 2,
} as const;

export type TokenTypeKey = keyof typeof TokenType;
export type TokenTypeValue = (typeof TokenType)[keyof typeof TokenType];
