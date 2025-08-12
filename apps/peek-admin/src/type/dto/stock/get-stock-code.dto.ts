import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetStockCodeDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  code: number;
}
