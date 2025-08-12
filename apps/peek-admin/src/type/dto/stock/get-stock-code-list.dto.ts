import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class GetStockCodeListDto {
  @IsInt()
  @Type(() => Number)
  page: number;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsOptional()
  category: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsOptional()
  text: string;
}
