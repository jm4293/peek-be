import { Controller, Get } from '@nestjs/common';

import { Public } from '@peek/decorator/public';

import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Public()
  @Get('list')
  async getCurrencyList() {
    const { data, total } = await this.currencyService.getCurrencyList();

    return {
      currencyList: data,
      total,
    };
  }
}
