import { IsNotEmpty, IsNumberString } from 'class-validator';

export class GetInquiryDto {
  @IsNumberString()
  @IsNotEmpty()
  inquiryId: number;
}
