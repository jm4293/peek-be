// export enum UserAccountStatusEnum {
//   ACTIVE = 1,
//   DELETE = 2,
//   PAUSED = 9,
// }

export const UserAccountStatus = {
  ACTIVE: 1,
  DELETE: 2,
  PAUSED: 9,
} as const;

export type UserAccountStatusKey = keyof typeof UserAccountStatus;
export type UserAccountStatusValue = (typeof UserAccountStatus)[keyof typeof UserAccountStatus];
