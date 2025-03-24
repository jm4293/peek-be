import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserAccountTypeEnum } from '@libs/constant/enum';

export class LoginOauthDto {
  @Transform(({ value }) => value.trim())
  @IsEnum(UserAccountTypeEnum)
  @IsNotEmpty()
  userAccountType: UserAccountTypeEnum;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
