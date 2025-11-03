import { IsNotEmpty, IsNumberString } from 'class-validator';

export class GetNoticeDto {
  @IsNumberString()
  @IsNotEmpty()
  id: number;
}
