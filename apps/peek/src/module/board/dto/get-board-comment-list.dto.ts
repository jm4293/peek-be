import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetBoardCommentListDto {
  @IsInt()
  @Type(() => Number)
  page: number;
}
