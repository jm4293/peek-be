import { Module } from '@nestjs/common';

import { TokenRepository } from '@database/repositories/token';

import { KisKoreanIndexGateway } from './kis-korean-index.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [KisKoreanIndexGateway, TokenRepository],
  exports: [],
})
export class KisWebSocketModule {}
