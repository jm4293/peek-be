import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetBoardListDto {
  @IsInt()
  @Type(() => Number)
  page: number;
}
