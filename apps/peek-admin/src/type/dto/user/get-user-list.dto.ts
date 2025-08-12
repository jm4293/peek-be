import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetUserListDto {
  @IsInt()
  @Type(() => Number)
  page: number;
}
