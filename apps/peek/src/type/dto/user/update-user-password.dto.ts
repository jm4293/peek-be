import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { IUpdateUserPassword } from '../../interface';

export class UpdateUserPasswordDto implements IUpdateUserPassword {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  password: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
