import { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://stock.peek.run'],
    credentials: true,
  },
  namespace: '/kis-websocket',
})
export class KisWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KisWebSocketGateway.name);
  private kisWebSocket: WebSocket | null = null;
  private connectedClients = new Set<Socket>();

  async handleConnection(client: Socket) {
    this.logger.log(`클라이언트 연결: ${client.id}`);
    this.connectedClients.add(client);

    // 첫 번째 클라이언트가 연결될 때 KIS WebSocket 연결
    if (this.connectedClients.size === 1) {
      await this.connectToKisWebSocket();
    }

    await this.connectToKisWebSocket();
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 연결 해제: ${client.id}`);
    this.connectedClients.delete(client);

    // 모든 클라이언트가 연결 해제되면 KIS WebSocket 종료
    if (this.connectedClients.size === 0) {
      this.disconnectFromKisWebSocket();
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@MessageBody() data: { token: string; symbol?: string }, @ConnectedSocket() client: Socket) {
    this.logger.log(`구독 요청: ${client.id}, 토큰: ${data.token}`);

    if (this.kisWebSocket && this.kisWebSocket.readyState === WebSocket.OPEN) {
      const subscribeMsg = {
        header: {
          approval_key: data.token,
          custtype: 'P',
          tr_type: '1',
          'content-type': 'utf-8',
        },
        body: {
          input: {
            tr_id: 'HDFSASP0',
            tr_key: 'DNASAAPL',
          },
        },
      };

      this.kisWebSocket.send(JSON.stringify(subscribeMsg));
      client.emit('subscribed', { success: true });
    } else {
      client.emit('error', { message: 'KIS WebSocket이 연결되지 않았습니다.' });
    }
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@MessageBody() data: { token: string; symbol?: string }, @ConnectedSocket() client: Socket) {
    this.logger.log(`구독 해제: ${client.id}`);

    if (this.kisWebSocket && this.kisWebSocket.readyState === WebSocket.OPEN) {
      const unsubscribeMsg = {
        header: {
          approval_key: data.token,
          custtype: 'P',
          tr_type: '2',
          'content-type': 'utf-8',
        },
        body: {
          input: {
            tr_id: 'HDFSASP0',
            tr_key: 'DNASAAPL',
          },
        },
      };

      this.kisWebSocket.send(JSON.stringify(unsubscribeMsg));
    }
  }

  private async connectToKisWebSocket() {
    try {
      this.logger.log('KIS WebSocket 연결 시작');
      this.kisWebSocket = new WebSocket('ws://ops.koreainvestment.com:21000');

      //   this.kisWebSocket.onopen = () => {
      //     this.logger.log('KIS WebSocket 연결 성공');
      //     this.server.emit('kis-connected');
      //   };

      this.kisWebSocket.onopen = () => {
        const subscribeMsg = {
          header: {
            approval_key: 'def07058-7680-4cd8-837a-0856c48bacf1',
            custtype: 'P',
            tr_type: '1',
            'content-type': 'utf-8',
          },
          body: {
            input: {
              tr_id: 'HDFSASP0',
              tr_key: 'DNASAAPL',
            },
          },
        };

        this.kisWebSocket.send(JSON.stringify(subscribeMsg));
      };

      this.kisWebSocket.onmessage = (event) => {
        try {
          const data = event.data?.split('|')[3]?.split('^');

          if (data) {
            const priceData = {
              symbol: data[1],
              localDate: data[3],
              localTime: data[4],
              koreanDate: data[5],
              koreanTime: data[6],
              bidPrice: data[11],
              askPrice: data[12],
              buyBalance: data[13],
              sellBalance: data[14],
            };

            // console.info('priceData', priceData);

            // 모든 연결된 클라이언트에게 데이터 전송
            this.server.emit('price-update', priceData);
          }
        } catch (error) {
          this.logger.error('메시지 파싱 오류:', error);
        }
      };

      this.kisWebSocket.onerror = (error) => {
        this.logger.error('KIS WebSocket 오류:', error);
        this.server.emit('kis-error', { message: 'KIS WebSocket 연결 오류' });
      };

      this.kisWebSocket.onclose = (event) => {
        this.logger.log(`KIS WebSocket 연결 종료: ${event.code} - ${event.reason}`);
        this.server.emit('kis-disconnected');

        // 재연결 시도 (5초 후)
        if (this.connectedClients.size > 0) {
          setTimeout(() => {
            this.connectToKisWebSocket();
          }, 5000);
        }
      };
    } catch (error) {
      this.logger.error('KIS WebSocket 연결 실패:', error);
    }
  }

  private disconnectFromKisWebSocket() {
    if (this.kisWebSocket) {
      this.logger.log('KIS WebSocket 연결 해제');
      this.kisWebSocket.close();
      this.kisWebSocket = null;
    }
  }
}
