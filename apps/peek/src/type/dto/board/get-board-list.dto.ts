import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

import { StockKindEnum } from '@libs/constant';

export class GetBoardListDto {
  @IsInt()
  @Type(() => Number)
  pageParam: number;

  @IsOptional()
  @IsEnum(StockKindEnum)
  marketType?: StockKindEnum;
}
