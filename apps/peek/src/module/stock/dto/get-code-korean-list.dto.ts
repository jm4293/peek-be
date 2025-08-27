import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

import { StockCategoryEnum } from '@constant/enum/stock';

export class GetCodeKoreanListDto {
  @IsInt()
  @Type(() => Number)
  page: number;

  @IsOptional()
  @Type(() => Number)
  kind: StockCategoryEnum;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  text: string;
}
