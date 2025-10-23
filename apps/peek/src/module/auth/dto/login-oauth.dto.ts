import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { UserAccountTypeEnum } from '@constant/enum/user';

export class LoginOauthDto {
  @IsEnum(UserAccountTypeEnum)
  @IsNotEmpty()
  userAccountType: UserAccountTypeEnum;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  tokenType: string | null;

  @IsNumber()
  @IsOptional()
  expire: string | null;
}
