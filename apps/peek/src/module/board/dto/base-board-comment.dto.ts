import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class BaseBoardCommentDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
