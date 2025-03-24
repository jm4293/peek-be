import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { IBaseBoardComment } from '../../interface';

export class UpdateBoardCommentDto implements IBaseBoardComment {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
