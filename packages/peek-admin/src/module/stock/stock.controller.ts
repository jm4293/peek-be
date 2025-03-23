import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { StockService } from './stock.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('upload/kospi')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKOSPI(@UploadedFile() file: Express.Multer.File) {
    await this.stockService.uploadFile({ file, dataType: 'KOSPI' });
  }

  @Post('upload/kosdaq')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKODDAQ(@UploadedFile() file: Express.Multer.File) {
    await this.stockService.uploadFile({ file, dataType: 'KOSDAQ' });
  }
}
