import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class BaseBoardDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
