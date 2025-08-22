import { Module } from '@nestjs/common';

import { KisWebSocketGateway } from './kis-websocket.gateway';

@Module({
  providers: [KisWebSocketGateway],
})
export class KisWebSocketModule {}
