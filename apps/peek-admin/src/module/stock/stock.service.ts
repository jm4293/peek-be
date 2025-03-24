import { BadRequestException, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

import { KOSDAQCode, KOSPICode } from '@libs/database/entities';
import { KOSDAQCodeRepository, KOSPICodeRepository } from '@libs/database/repositories';

@Injectable()
export class StockService {
  constructor(
    private readonly kospiCodeRepository: KOSPICodeRepository,
    private readonly kosdaqCodeRepository: KOSDAQCodeRepository,
  ) {}

  async uploadFile(params: { file: Express.Multer.File; dataType: 'KOSPI' | 'KOSDAQ' }) {
    const { file, dataType } = params;

    this.isCheckXLSXFile(file);

    const arr = this.parseXLSXFile(file);

    await this.saveStockCodes({ arr, dataType });
  }

  private isCheckXLSXFile(file: Express.Multer.File) {
    const ret = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!ret) {
      throw new BadRequestException('XLSX 파일이 아닙니다.');
    }
  }

  private parseXLSXFile(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = '유가증권';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new BadRequestException('유가증권 시트가 없습니다.');
    }

    const ref = worksheet['!ref'];

    if (!ref) {
      throw new BadRequestException('시트에 데이터가 없습니다.');
    }

    const range = XLSX.utils.decode_range(ref);

    const { s: start, e: end } = range;

    const rowCount = end.r - start.r + 1;
    const colCount = end.c - start.c + 1;

    const arr = Array.from({ length: rowCount }, (_, i) => {
      return Array.from({ length: colCount }, (_, j) => {
        const cellRef = XLSX.utils.encode_cell({ r: start.r + i, c: start.c + j });
        const cell = worksheet[cellRef];

        return cell ? cell.v : null;
      });
    });

    arr.shift();

    return arr;
  }

  private async saveStockCodes(params: { arr: any[]; dataType: 'KOSPI' | 'KOSDAQ' }) {
    const { arr, dataType } = params;

    const excelDateToJSDate = (serial: number) => {
      const excelEpoch = new Date(1899, 11, 30);
      const jsDate = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
      return dayjs(jsDate).format('YYYY-MM-DD');
    };

    if (dataType === 'KOSPI') {
      const entities = arr.map((row) => {
        const entity = new KOSPICode();

        entity.companyName = row[0] as string;
        entity.code = row[1] as number;
        entity.industry = row[2] as string;
        entity.products = row[3] as string;
        entity.listingAt = excelDateToJSDate(row[4]);
        entity.ceo = row[6] as string;
        entity.homePage = row[7] as string;
        entity.marketType = 'kospi';

        return entity;
      });

      await this.kospiCodeRepository.save(entities);
    }

    if (dataType === 'KOSDAQ') {
      const entities = arr.map((row) => {
        const entity = new KOSDAQCode();

        entity.companyName = row[0] as string;
        entity.code = row[1] as number;
        entity.industry = row[2] as string;
        entity.products = row[3] as string;
        entity.listingAt = excelDateToJSDate(row[4]);
        entity.ceo = row[6] as string;
        entity.homePage = row[7] as string;
        entity.marketType = 'kosdaq';

        return entity;
      });

      await this.kosdaqCodeRepository.save(entities);
    }
  }
}
