import { Module } from '@nestjs/common';

import { KisTokenRepository } from '@database/repositories/kis';

import { KisDomesticStockGateway } from './kis-domestic-stock.gateway';
import { KisIndexGateway } from './kis-index.gateway';
import { KisStockGateway } from './kis-stock.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [
    KisIndexGateway,
    // KisStockGateway,
    // KisDomesticStockGateway,
    KisTokenRepository,
  ],
  exports: [],
})
export class KisWebSocketModule {}
