import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class PostOuathTokenDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  grant_type: 'client_credentials';

  @Transform(({ value }) => value.trim())
  @IsString()
  appkey: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  appsecret: string;
}
