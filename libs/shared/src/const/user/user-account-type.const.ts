// export enum UserAccountTypeEnum {
//   EMAIL = 1,
//   KAKAO = 2,
//   NAVER = 3,
//   GOOGLE = 4,
// }

// export const userAccountTypeDescription = {
//   [UserAccountTypeEnum.EMAIL]: '이메일',
//   [UserAccountTypeEnum.GOOGLE]: '구글',
//   [UserAccountTypeEnum.KAKAO]: '카카오',
//   [UserAccountTypeEnum.NAVER]: '네이버',
// };

export const UserAccountType = {
  EMAIL: 1,
  KAKAO: 2,
  NAVER: 3,
  GOOGLE: 4,
} as const;

export type UserAccountTypeKey = keyof typeof UserAccountType;
export type UserAccountTypeValue = (typeof UserAccountType)[keyof typeof UserAccountType];

export const userAccountTypeDescription = {
  [UserAccountType.EMAIL]: '이메일',
  [UserAccountType.GOOGLE]: '구글',
  [UserAccountType.KAKAO]: '카카오',
  [UserAccountType.NAVER]: '네이버',
};
