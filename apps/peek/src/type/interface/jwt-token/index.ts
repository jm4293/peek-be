import { UserAccountTypeEnum } from '@libs/constant/enum';

export interface IJwtToken {
  userSeq: number;
  userAccountType: UserAccountTypeEnum;
  expiresIn?: number;
}
