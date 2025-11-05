import { IsNumber, IsOptional } from 'class-validator';

import { BaseBoardCommentDto } from './base-board-comment.dto';

export class CreateBoardCommentDto extends BaseBoardCommentDto {
  @IsNumber()
  @IsOptional()
  boardCommentId: number;
}
