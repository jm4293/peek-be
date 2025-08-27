import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetStockKoreanDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  code: string;
}
