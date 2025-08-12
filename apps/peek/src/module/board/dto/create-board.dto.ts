import { IsNotEmpty } from 'class-validator';

import { BaseBoardDto } from './base-board.dto';

export class CreateBoardDto extends BaseBoardDto {
  @IsNotEmpty()
  categoryId: number;
}
