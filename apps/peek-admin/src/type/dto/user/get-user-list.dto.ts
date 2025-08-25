import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetUserListDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  page: number;
}
