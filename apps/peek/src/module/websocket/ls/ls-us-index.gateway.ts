import { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { SecuritiesTokenRepository } from '@libs/database/repositories/stock';

@WebSocketGateway({})
export class LsUsIndexGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  socketServer: Server;

  private dowjonesIndex = null;
  private snp500Index = null;
  private nasdaqIndex = null;

  private readonly logger = new Logger(LsUsIndexGateway.name);

  constructor(private readonly securitiesTokenRepository: SecuritiesTokenRepository) {}

  async handleConnection(client: Socket) {}

  async handleDisconnect(client: Socket) {}
}
