import dayjs from 'dayjs';
import { FindOptionsOrder, Like } from 'typeorm';
import * as XLSX from 'xlsx';

import { BadRequestException, Injectable } from '@nestjs/common';

import { ADMIN_LIST_LIMIT } from '@peek-admin/shared/list';
import { GetStockCodeListDto } from '@peek-admin/type/dto';

import { StockKoreanCompany } from '@libs/database/entities/stock';
import { StockCategoryRepository, StockCompanyRepository } from '@libs/database/repositories/stock';

@Injectable()
export class StockService {
  constructor(
    private readonly stockRepository: StockCompanyRepository,
    private readonly stockCategoryRepository: StockCategoryRepository,
  ) {}

  async getStockCompanyList(query: GetStockCodeListDto) {
    const { page, category, text } = query;

    let whereCondition = {};

    const orderCondition: FindOptionsOrder<StockKoreanCompany> = { companyName: 'ASC' };

    if (category) {
      whereCondition = { ...whereCondition, category: category };
    }

    if (text) {
      whereCondition = { ...whereCondition, companyName: Like(`%${text}%`) };
    }

    return await this.stockRepository.findAndCount({
      where: whereCondition,
      order: orderCondition,
      take: ADMIN_LIST_LIMIT,
      skip: (page - 1) * ADMIN_LIST_LIMIT,
    });
  }

  async getStockCompany(code: string) {
    return await this.stockRepository.findOne({ where: { code } });
  }

  async deleteStock() {
    // await this.stockRepository.delete({});
  }

  async uploadStock(params: { file: Express.Multer.File; dataType: 'KOSPI' | 'KOSDAQ' }) {
    const { file, dataType } = params;

    this._isCheckXLSXFile(file);

    const arr = this._parseXLSXFile(file);

    const category = await this.stockCategoryRepository.findByEnName(dataType);

    if (!category) {
      throw new BadRequestException(`${dataType} 카테고리가 존재하지 않습니다.`);
    }

    await this._saveStockCodes({ arr, dataType, stockCategoryId: category.id });
  }

  private _isCheckXLSXFile(file: Express.Multer.File) {
    const ret = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!ret) {
      throw new BadRequestException('XLSX 파일이 아닙니다.');
    }
  }

  private _parseXLSXFile(file: Express.Multer.File) {
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

  private async _saveStockCodes(params: { arr: any[]; dataType: 'KOSPI' | 'KOSDAQ'; stockCategoryId: number }) {
    const { arr, dataType, stockCategoryId } = params;

    const excelDateToJSDate = (serial: number) => {
      const excelEpoch = new Date(1899, 11, 30);
      const jsDate = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
      return dayjs(jsDate).format('YYYY-MM-DD');
    };

    if (dataType === 'KOSPI') {
      const entities = arr.map((row) => {
        const entity = new StockKoreanCompany();

        entity.companyName = row[0];
        entity.code = String(row[1]).padStart(6, '0');
        entity.industry = row[2];
        entity.products = row[3];
        entity.listingAt = excelDateToJSDate(row[4]);
        entity.ceo = row[6];
        entity.homePage = row[7];
        entity.stockCategoryId = stockCategoryId;

        return entity;
      });

      await this.stockRepository.save(entities);
    }

    if (dataType === 'KOSDAQ') {
      const entities = arr.map((row) => {
        const entity = new StockKoreanCompany();

        entity.companyName = row[0];
        entity.code = String(row[1]).padStart(6, '0');
        entity.industry = row[2];
        entity.products = row[3];
        entity.listingAt = excelDateToJSDate(row[4]);
        entity.ceo = row[6];
        entity.homePage = row[7];
        entity.stockCategoryId = stockCategoryId;

        return entity;
      });

      await this.stockRepository.save(entities);
    }
  }
}
