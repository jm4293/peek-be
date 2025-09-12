import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetInquiryListDto {
  @IsInt()
  @Type(() => Number)
  page: number;
}
