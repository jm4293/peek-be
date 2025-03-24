import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { IBaseBoard } from '../../interface';

export class CreateBoardDto implements IBaseBoard {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
