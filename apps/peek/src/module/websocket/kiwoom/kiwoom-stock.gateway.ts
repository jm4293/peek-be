import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { TokenRepository } from '@database/repositories/token';

@WebSocketGateway({
  cors: {},
  namespace: '/kiwoom/korean/stock',
})
export class KiwoomStockGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KiwoomStockGateway.name);
  private kiwoomWebSocket: WebSocket | null = null;
  private kiwoomWebSocketToken: string | null = null;

  constructor(
    private readonly configService: ConfigService,

    private readonly tokenRepository: TokenRepository,
  ) {}

  async onModuleInit() {}

  async handleConnection(client: Socket) {}

  async handleDisconnect(client: Socket) {}

  private async _setKisToken() {}
}
