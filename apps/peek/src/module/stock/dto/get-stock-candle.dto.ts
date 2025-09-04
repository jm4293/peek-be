import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetStockCandleDto {
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : undefined))
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : undefined))
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 200)
  limit?: number;
}
