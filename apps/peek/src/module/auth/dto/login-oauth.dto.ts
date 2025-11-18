import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { UserAccountType, UserAccountTypeValue } from '@libs/shared/const/user';

export class LoginOauthDto {
  @IsEnum(UserAccountType)
  @IsNotEmpty()
  userAccountType: UserAccountTypeValue;

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
