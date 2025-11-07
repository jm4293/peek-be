import { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'https://stock.peek.run'] },
  namespace: '/ls/korean/top10',
})
export class LsKoreanTo10Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  socketServer: Server;

  private readonly logger = new Logger(LsKoreanTo10Gateway.name);

  private korean10: any = {};

  constructor() {}

  async handleConnection(client: Socket) {
    this.logger.log(`웹소켓 LS 한국 Top10 클라이언트 연결: ${client.id}`);

    client.emit('connected', true);

    if (!this.korean10.createdAt) {
      return;
    }

    this.socketServer.emit('korean-top-10', this.korean10.data, this.korean10.createdAt);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`웹소켓 LS 한국 Top10 클라이언트 연결 해제: ${client.id}`);
  }

  async updateKorean10(data: any[]) {
    this.korean10 = { createdAt: new Date().toISOString(), data };
    this.socketServer.emit('korean-top-10', this.korean10.data, this.korean10.createdAt);
  }

  //   async setKorean10(data: any) {
  //     this.korean10 = data;
  //   }
}
