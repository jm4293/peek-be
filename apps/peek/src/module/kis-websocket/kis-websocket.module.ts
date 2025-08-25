import { Module } from '@nestjs/common';

import { KisTokenRepository } from '@database/repositories/kis';

import { KisWebSocketGateway } from './kis-websocket.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [KisWebSocketGateway, KisTokenRepository],
  exports: [],
})
export class KisWebSocketModule {}
