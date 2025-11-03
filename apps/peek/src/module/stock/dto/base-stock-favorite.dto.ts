import { IsNotEmpty, IsNumberString } from 'class-validator';

export class BaseStockFavoriteDto {
  @IsNumberString()
  @IsNotEmpty()
  stockKoreanCompanyId: number;
}
