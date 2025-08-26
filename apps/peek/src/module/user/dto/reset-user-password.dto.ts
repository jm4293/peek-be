import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetUserPasswordDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  password: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  code: string;
}
