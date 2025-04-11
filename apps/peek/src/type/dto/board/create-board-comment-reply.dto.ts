import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { IBaseBoardCommentReply } from '../../interface';

export class CreateBoardCommentReplyDto implements IBaseBoardCommentReply {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
