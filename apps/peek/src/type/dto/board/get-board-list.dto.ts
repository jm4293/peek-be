import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class GetBoardListDto {
  @IsInt()
  @Type(() => Number)
  pageParam: number;

  @IsOptional()
  category?: number;
}
