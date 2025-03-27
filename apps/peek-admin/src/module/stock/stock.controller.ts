import { Response } from 'express';

import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { StockKindEnum } from '@libs/constant';

import { ResConfig } from '../../config';
import { PageQueryDto } from '../../type/dto/pagenation';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async getCodeList(
    @Query() pageQuery: PageQueryDto,
    @Query('kind') kind: StockKindEnum,
    @Query('text') text: string,
    @Res() res: Response,
  ) {
    const ret = await this.stockService.getCodeList({ pageQuery, kind, text: text?.trim() });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Get(':code')
  async getCodeDetail(@Param('code', ParseIntPipe) code: number, @Res() res: Response) {
    const ret = await this.stockService.getCodeDetail({ code });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Delete()
  async deleteStock() {
    await this.stockService.deleteStock();
  }

  @Post('upload/kospi')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKOSPI(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    await this.stockService.uploadStock({ file, dataType: 'KOSPI' });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Post('upload/kosdaq')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKODDAQ(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    await this.stockService.uploadStock({ file, dataType: 'KOSDAQ' });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }
}
