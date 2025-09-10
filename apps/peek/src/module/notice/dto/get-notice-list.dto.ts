import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class GetNoticeListDto {
  @IsInt()
  @Type(() => Number)
  page: number;
}
