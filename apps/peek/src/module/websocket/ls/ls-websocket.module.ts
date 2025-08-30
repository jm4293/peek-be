import { Module } from '@nestjs/common';

import { TokenRepository } from '@database/repositories/token';

import { LsDomesticIndexGateway } from './ls-domestic-index.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [LsDomesticIndexGateway, TokenRepository],
  exports: [],
})
export class LsWebSocketModule {}
