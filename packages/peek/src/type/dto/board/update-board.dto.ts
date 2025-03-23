import { IBaseBoard } from '../../interface';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBoardDto implements IBaseBoard {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
