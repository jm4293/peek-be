import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { StockCategoryEnum } from '@libs/constant';

import { IBaseBoard } from '../../interface';

export class CreateBoardDto implements IBaseBoard {
  @Transform(({ value }) => value.trim())
  @IsEnum(StockCategoryEnum)
  @IsNotEmpty()
  category: StockCategoryEnum;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
