export enum UserAccountTypeEnum {
  EMAIL = 1,
  KAKAO = 2,
  NAVER = 3,
  GOOGLE = 4,
}

export const userAccountTypeDescription = {
  [UserAccountTypeEnum.EMAIL]: '이메일',
  [UserAccountTypeEnum.GOOGLE]: '구글',
  [UserAccountTypeEnum.KAKAO]: '카카오',
  [UserAccountTypeEnum.NAVER]: '네이버',
};
