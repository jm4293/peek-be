import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { UserAccountTypeEnum } from '@constant/enum/user';

export class LoginOauthDto {
  @IsEnum(UserAccountTypeEnum)
  @IsNotEmpty()
  userAccountType: UserAccountTypeEnum;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  token: string;
}
