import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class GetBoardListDto {
  @IsInt()
  @Type(() => Number)
  page: number;

  @IsOptional()
  stockCategory?: number;

  @IsOptional()
  sort?: 'createdAt' | 'viewCount';

  @IsOptional()
  text?: string;
}
