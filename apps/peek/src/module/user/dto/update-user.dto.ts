import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  name: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  birthday: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  thumbnail: string;
}
