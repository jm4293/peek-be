import { IBaseBoardComment } from '../../interface';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBoardCommentDto implements IBaseBoardComment {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
