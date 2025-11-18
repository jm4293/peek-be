import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

import { StockCategoryValue } from '@libs/shared/const/stock';

export class GetStockKoreanListDto {
  @IsInt()
  @Type(() => Number)
  page: number;

  @IsOptional()
  @Type(() => Number)
  kind: StockCategoryValue;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  text: string;
}
