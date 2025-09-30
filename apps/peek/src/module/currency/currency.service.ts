import { Injectable } from '@nestjs/common';

import { CurrencyHistory } from '@database/entities/currency';
import { CurrencyHistoryRepository } from '@database/repositories/currency';

@Injectable()
export class CurrencyService {
  constructor(private readonly currencyHistoryRepository: CurrencyHistoryRepository) {}

  async getCurrencyList() {
    const currencyList = await this.currencyHistoryRepository.find({
      order: { id: 'DESC' },
      take: 8,
    });

    const currencyMap = new Map<string, CurrencyHistory>();

    currencyList.forEach((currency) => {
      if (!currencyMap.has(currency.curUnit)) {
        currencyMap.set(currency.curUnit, currency);
      }
    });

    return { data: Array.from(currencyMap.values()), total: currencyMap.size };
  }
}
