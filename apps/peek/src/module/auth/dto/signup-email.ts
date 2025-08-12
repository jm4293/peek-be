import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupEmailDto {
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
  birthday: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  thumbnail: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  password: string;
}
