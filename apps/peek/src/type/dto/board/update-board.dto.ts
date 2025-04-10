import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { StockKindEnum } from '@libs/constant';

import { IBaseBoard } from '../../interface';

export class UpdateBoardDto implements IBaseBoard {
  @Transform(({ value }) => value.trim())
  @IsEnum(StockKindEnum)
  @IsNotEmpty()
  marketType: StockKindEnum;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  content: string;
}
