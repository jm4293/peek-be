import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class RegisterUserPushTokenDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  pushToken: string;
}
