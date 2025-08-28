import { Module } from '@nestjs/common';

import { KisTokenRepository } from '@database/repositories/kis';

import { KisIndexGateway } from './kis-index.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [KisIndexGateway, KisTokenRepository],
  exports: [],
})
export class KisWebSocketModule {}
