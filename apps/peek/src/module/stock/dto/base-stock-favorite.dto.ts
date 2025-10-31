import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class BaseStockFavoriteDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  stockKoreanCompanyId: number;
}
