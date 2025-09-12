import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetInquiryDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  id: number;
}
