import { IsNotEmpty, IsNumberString } from 'class-validator';

export class DeleteBoardDto {
  @IsNumberString()
  @IsNotEmpty()
  boardId: number;
}
