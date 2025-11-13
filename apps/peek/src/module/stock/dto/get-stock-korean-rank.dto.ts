import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { StockRank, StockRankValue } from 'libs/shared/src/const/stock';

export class GetStockKoreanRankDto {
  @IsInt()
  @Type(() => Number)
  page: number;

  @IsNotEmpty()
  @IsEnum(StockRank)
  type: StockRankValue;
}
