import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IUpdateUser } from '../../interface';

export class UpdateUserDto implements IUpdateUser {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  birthday: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  thumbnailUrl: string;
}
