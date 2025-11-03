import { IsNotEmpty, IsNumberString } from 'class-validator';

export class GetBoardCommentDto {
  @IsNumberString()
  @IsNotEmpty()
  boardCommentId: number;
}
