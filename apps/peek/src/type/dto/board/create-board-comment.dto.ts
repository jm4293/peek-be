import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { IBaseBoardComment } from '../../interface';

export class CreateBoardCommentDto implements IBaseBoardComment {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
