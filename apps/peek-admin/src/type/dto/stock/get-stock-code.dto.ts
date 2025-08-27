import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class GetStockCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
