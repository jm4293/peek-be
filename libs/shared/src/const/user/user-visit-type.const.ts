// export enum UserVisitTypeEnum {
//   SIGN_IN_EMAIL = 1,
//   SIGN_IN_OAUTH = 2,
//   SIGN_OUT = 4,
//   WITHDRAWAL = 9,
// }

export const UserVisitType = {
  SIGN_IN_EMAIL: 1,
  SIGN_IN_OAUTH: 2,
  SIGN_OUT: 4,
  WITHDRAWAL: 9,
} as const;

export type UserVisitTypeKey = keyof typeof UserVisitType;
export type UserVisitTypeValue = (typeof UserVisitType)[keyof typeof UserVisitType];
