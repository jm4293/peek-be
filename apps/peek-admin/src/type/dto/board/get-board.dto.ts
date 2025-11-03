import { IsNotEmpty, IsNumberString } from 'class-validator';

export class GetBoardDto {
  @IsNumberString()
  @IsNotEmpty()
  boardId: number;
}
