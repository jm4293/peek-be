import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetNoticeDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  noticeId: number;
}
