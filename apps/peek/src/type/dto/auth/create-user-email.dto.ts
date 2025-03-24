import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IBaseUser, IBaseUserAccount } from '../../interface';

export class CreateUserEmailDto implements IBaseUser, IBaseUserAccount {
  // BaseUserInterface 속성
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  policy: boolean;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  birthdate?: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  thumbnail?: string;

  // BaseUserAccountInterface 속성
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  password: string;
}
