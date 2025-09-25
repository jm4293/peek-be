import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetStockFavoriteListDto {
  @Type(() => Number)
  @IsNumber()
  page: number;
}
