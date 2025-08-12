import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserThumbnailDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  thumbnail: string;
}
