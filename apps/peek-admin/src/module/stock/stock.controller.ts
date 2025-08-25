import { Response } from 'express';

import { Controller, Delete, Get, Param, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ResConfig } from '@peek-admin/config/_res.config';
import { GetStockCodeDto, GetStockCodeListDto } from '@peek-admin/type/dto';

import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get(':code')
  async getStockCompany(@Param() param: GetStockCodeDto) {
    const { code } = param;

    const ret = await this.stockService.getStockCompany(code);

    // return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Get()
  async getStockCompanyList(@Query() query: GetStockCodeListDto) {
    const [stockCompanies, total] = await this.stockService.getStockCompanyList(query);

    // return ResConfig.Success({ res, statusCode: 'OK', data: { stockCompanies, total } });

    return {
      stockCompanyList: stockCompanies,
      total,
    };
  }

  @Delete()
  async deleteStock() {
    // await this.stockService.deleteStock();
  }

  @Post('upload/kospi')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKOSPI(@UploadedFile() file: Express.Multer.File) {
    await this.stockService.uploadStock({ file, dataType: 'KOSPI' });

    // return ResConfig.Success({ res, statusCode: 'OK' });
  }

  @Post('upload/kosdaq')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKODDAQ(@UploadedFile() file: Express.Multer.File) {
    await this.stockService.uploadStock({ file, dataType: 'KOSDAQ' });

    // return ResConfig.Success({ res, statusCode: 'OK' });
  }
}
