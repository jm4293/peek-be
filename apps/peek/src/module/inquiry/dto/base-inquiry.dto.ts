import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class BaseInquiryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsNotEmpty()
  images: string[];
}
