export enum UserAccountTypeEnum {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
}

export const userAccountTypeDescription = {
  [UserAccountTypeEnum.EMAIL]: '이메일',
  [UserAccountTypeEnum.GOOGLE]: '구글',
  [UserAccountTypeEnum.FACEBOOK]: '페이스북',
  [UserAccountTypeEnum.KAKAO]: '카카오',
  [UserAccountTypeEnum.NAVER]: '네이버',
};
