import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetBoardDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  boardId: number;
}
