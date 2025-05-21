import dayjs from 'dayjs';
import { FindOptionsOrder, Like } from 'typeorm';
import * as XLSX from 'xlsx';

import { BadRequestException, Injectable } from '@nestjs/common';

import { StockKindEnum } from '@libs/constant';

import { StockCompany } from '@libs/database/entities';

import { StockCompanyRepository } from '@libs/database/repositories';

import { PageQueryDto } from '../../type/dto/pagenation';

@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockCompanyRepository) {}

  async getCodeList(params: { pageQuery: PageQueryDto; kind: StockKindEnum; text: string }) {
    // const { pageQuery, kind, text } = params;
    // const { count, page } = pageQuery;
    //
    // let whereCondition = {};
    // let orderCondition: FindOptionsOrder<StockCompany> = { companyName: 'ASC' };
    //
    // if (kind) {
    //   whereCondition = { ...whereCondition, marketType: kind };
    // }
    //
    // if (text) {
    //   whereCondition = { ...whereCondition, companyName: Like(`%${text}%`) };
    // }
    //
    // const [stocks, total] = await this.stockRepository.findAndCount({
    //   where: whereCondition,
    //   order: orderCondition,
    //   take: count,
    //   skip: (page - 1) * count,
    // });
    //
    // return { stocks, total };
  }

  async getCodeDetail(params: { code: number }) {
    // const { code } = params;
    //
    // return await this.stockRepository.findOne({ where: { code } });
  }

  async deleteStock() {
    // await this.stockRepository.delete({});
  }

  async uploadStock(params: { file: Express.Multer.File; dataType: 'KOSPI' | 'KOSDAQ' }) {
    // const { file, dataType } = params;
    //
    // this._isCheckXLSXFile(file);
    //
    // const arr = this._parseXLSXFile(file);
    //
    // await this._saveStockCodes({ arr, dataType });
  }

  private _isCheckXLSXFile(file: Express.Multer.File) {
    // const ret = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    //
    // if (!ret) {
    //   throw new BadRequestException('XLSX 파일이 아닙니다.');
    // }
  }

  private _parseXLSXFile(file: Express.Multer.File) {
    // const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    // const sheetName = '유가증권';
    // const worksheet = workbook.Sheets[sheetName];
    //
    // if (!worksheet) {
    //   throw new BadRequestException('유가증권 시트가 없습니다.');
    // }
    //
    // const ref = worksheet['!ref'];
    //
    // if (!ref) {
    //   throw new BadRequestException('시트에 데이터가 없습니다.');
    // }
    //
    // const range = XLSX.utils.decode_range(ref);
    //
    // const { s: start, e: end } = range;
    //
    // const rowCount = end.r - start.r + 1;
    // const colCount = end.c - start.c + 1;
    //
    // const arr = Array.from({ length: rowCount }, (_, i) => {
    //   return Array.from({ length: colCount }, (_, j) => {
    //     const cellRef = XLSX.utils.encode_cell({ r: start.r + i, c: start.c + j });
    //     const cell = worksheet[cellRef];
    //
    //     return cell ? cell.v : null;
    //   });
    // });
    //
    // arr.shift();
    //
    // return arr;
  }

  private async _saveStockCodes(params: { arr: any[]; dataType: 'KOSPI' | 'KOSDAQ' }) {
    // const { arr, dataType } = params;
    //
    // const excelDateToJSDate = (serial: number) => {
    //   const excelEpoch = new Date(1899, 11, 30);
    //   const jsDate = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
    //   return dayjs(jsDate).format('YYYY-MM-DD');
    // };
    //
    // if (dataType === 'KOSPI') {
    //   const entities = arr.map((row) => {
    //     const entity = new StockCompany();
    //
    //     entity.companyName = row[0] as string;
    //     entity.code = row[1] as number;
    //     entity.industry = row[2] as string;
    //     entity.products = row[3] as string;
    //     entity.listingAt = excelDateToJSDate(row[4]);
    //     entity.ceo = row[6] as string;
    //     entity.homePage = row[7] as string;
    //     entity.marketType = 'KOSPI';
    //
    //     return entity;
    //   });
    //
    //   await this.stockRepository.save(entities);
    // }
    //
    // if (dataType === 'KOSDAQ') {
    //   const entities = arr.map((row) => {
    //     const entity = new StockCompany();
    //
    //     entity.companyName = row[0] as string;
    //     entity.code = row[1] as number;
    //     entity.industry = row[2] as string;
    //     entity.products = row[3] as string;
    //     entity.listingAt = excelDateToJSDate(row[4]);
    //     entity.ceo = row[6] as string;
    //     entity.homePage = row[7] as string;
    //     entity.marketType = 'KOSDAQ';
    //
    //     return entity;
    //   });
    //
    //   await this.stockRepository.save(entities);
    // }
  }
}
