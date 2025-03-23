import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CheckEmailDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  email: string;
}
