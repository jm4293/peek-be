export enum UserAccountTypeEnum {
  EMAIL = 1,
  GOOGLE = 2,
  FACEBOOK = 3,
  KAKAO = 4,
  NAVER = 5,
}

export const userAccountTypeDescription = {
  [UserAccountTypeEnum.EMAIL]: '이메일',
  [UserAccountTypeEnum.GOOGLE]: '구글',
  [UserAccountTypeEnum.FACEBOOK]: '페이스북',
  [UserAccountTypeEnum.KAKAO]: '카카오',
  [UserAccountTypeEnum.NAVER]: '네이버',
};
