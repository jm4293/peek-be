// export enum UserTypeEnum {
//   ADMIN = 1,
//   USER = 2,
// }

export const UserType = {
  ADMIN: 1,
  USER: 2,
} as const;

export type UserTypeKey = keyof typeof UserType;
export type UserTypeValue = (typeof UserType)[keyof typeof UserType];
