import { UserAccountTypeEnum } from '../../../constant/enum';

export interface IJwtToken {
  userSeq: number;
  userAccountType: UserAccountTypeEnum;
  expiresIn?: number;
}
