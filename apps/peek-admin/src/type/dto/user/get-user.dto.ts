import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetUserDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  userId: number;
}
