import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

import { StockRankEnum } from '@constant/enum/stock';

export class GetStockKoreanRankDto {
  @IsInt()
  @Type(() => Number)
  page: number;

  @IsNotEmpty()
  @IsEnum(StockRankEnum)
  type: StockRankEnum;
}
