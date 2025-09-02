import { Injectable } from '@nestjs/common';

import { CurrencyHistoryRepository } from '@database/repositories/currency';

@Injectable()
export class CurrencyService {
  constructor(private readonly currencyHistoryRepository: CurrencyHistoryRepository) {}

  async getCurrencyList() {
    const query = `
      SELECT * FROM currency_history ch1
      WHERE ch1.createdAt = (
        SELECT MAX(ch2.createdAt) 
        FROM currency_history ch2 
        WHERE ch2.curUnit = ch1.curUnit
      )
      ORDER BY 
        CASE ch1.curUnit
          WHEN 'USD' THEN 1
          WHEN 'EUR' THEN 2
          WHEN 'JPY' THEN 3
          WHEN 'CNH' THEN 4
        ELSE 5
      END
    `;

    const data = await this.currencyHistoryRepository.query(query);

    return { data, total: data.length };
  }
}
