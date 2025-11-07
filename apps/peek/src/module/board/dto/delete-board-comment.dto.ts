import { IsNotEmpty, IsNumberString } from 'class-validator';

export class DeleteBoardCommentDto {
  @IsNumberString()
  @IsNotEmpty()
  boardId: number;

  @IsNumberString()
  @IsNotEmpty()
  boardCommentId: number;
}
