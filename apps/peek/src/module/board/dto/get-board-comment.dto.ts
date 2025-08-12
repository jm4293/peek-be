import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetBoardCommentDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  boardCommentId: number;
}
