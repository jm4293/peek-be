import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { KisTokenRepository } from '@database/repositories/kis';

const KOSPI = '0001';
const KOSDAQ = '1001';

interface Subscription {
  tr_id: string;
  tr_key: string;
  clients: Set<Socket>;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://stock.peek.run'],
    credentials: true,
  },
  namespace: '/kis-websocket',
})
export class KisWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KisWebSocketGateway.name);
  private kisWebSocket: WebSocket | null = null;
  private connectedClients = new Set<Socket>();
  private subscriptions = new Map<string, Subscription>();

  constructor(private readonly kisTokenRepository: KisTokenRepository) {}

  async onModuleInit() {
    // console.log('KisWebSocketGateway initialized');
    // await this._connectToKisWebSocket();
  }

  async handleConnection(client: Socket) {
    this.logger.log(`클라이언트 연결: ${client.id}`);
    this.connectedClients.add(client);

    // 첫 번째 클라이언트가 연결될 때 KIS WebSocket 연결
    if (this.connectedClients.size === 1) {
      await this._connectToKisWebSocket();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 연결 해제: ${client.id}`);
    this.connectedClients.delete(client);

    // 클라이언트가 구독한 모든 종목에서 제거
    // this._removeClientFromAllSubscriptions(client);

    // 모든 클라이언트가 연결 해제되면 KIS WebSocket 종료
    if (this.connectedClients.size === 0) {
      this._disconnectFromKisWebSocket();
    }
  }

  // @SubscribeMessage('subscribe')
  // handleSubscribe(@MessageBody() data: { tr_id: string; tr_key: string }, @ConnectedSocket() client: Socket) {
  //   this.logger.log(`구독 요청: ${client.id}, tr_id: ${data.tr_id}, tr_key: ${data.tr_key}`);

  //   if (this.kisWebSocket && this.kisWebSocket.readyState === WebSocket.OPEN) {
  //     this.logger.log(`KIS WebSocket 상태: ${this.kisWebSocket.readyState} (OPEN=${WebSocket.OPEN})`);

  //     const subscriptionKey = `${data.tr_id}_${data.tr_key}`;

  //     // 새로운 종목 구독인 경우
  //     if (!this.subscriptions.has(subscriptionKey)) {
  //       this.subscriptions.set(subscriptionKey, {
  //         tr_id: data.tr_id,
  //         tr_key: data.tr_key,
  //         clients: new Set([client]),
  //       });

  //       // KIS에 구독 요청
  //       this._subscribeToKis(data.tr_id, data.tr_key);
  //       this.logger.log(`새로운 종목 구독: ${subscriptionKey}`);
  //     } else {
  //       // 기존 구독에 클라이언트 추가
  //       this.subscriptions.get(subscriptionKey)!.clients.add(client);
  //       this.logger.log(`기존 구독에 클라이언트 추가: ${subscriptionKey}`);
  //     }

  //     client.emit('subscribed', { success: true, tr_id: data.tr_id, tr_key: data.tr_key });
  //     this.logger.log(`구독 완료: ${client.id} -> ${subscriptionKey}`);
  //   } else {
  //     this.logger.error(`KIS WebSocket이 연결되지 않음. 상태: ${this.kisWebSocket?.readyState}`);
  //     client.emit('error', { message: 'KIS WebSocket이 연결되지 않았습니다.' });
  //   }
  // }

  // private _subscribeToKis(tr_id: string, tr_key: string) {
  //   if (this.kisWebSocket && this.kisWebSocket.readyState === WebSocket.OPEN) {
  //     const subscribeMsg = {
  //       header: {
  //         approval_key: 'def07058-7680-4cd8-837a-0856c48bacf1',
  //         custtype: 'P',
  //         tr_type: '1',
  //         'content-type': 'utf-8',
  //       },
  //       body: {
  //         input: {
  //           tr_id: tr_id,
  //           tr_key: tr_key,
  //         },
  //       },
  //     };

  //     this.logger.log(`KIS 구독 요청 전송: ${JSON.stringify(subscribeMsg)}`);
  //     this.kisWebSocket.send(JSON.stringify(subscribeMsg));
  //     this.logger.log(`KIS 구독 요청: ${tr_id} - ${tr_key}`);
  //   } else {
  //     this.logger.error(`KIS 구독 실패: WebSocket 상태가 OPEN이 아님. 상태: ${this.kisWebSocket?.readyState}`);
  //   }
  // }

  // @SubscribeMessage('unsubscribe')
  // handleUnsubscribe(@MessageBody() data: { tr_id: string; tr_key: string }, @ConnectedSocket() client: Socket) {
  //   this.logger.log(`구독 해제: ${client.id}, tr_id: ${data.tr_id}, tr_key: ${data.tr_key}`);

  //   const subscriptionKey = `${data.tr_id}_${data.tr_key}`;
  //   const subscription = this.subscriptions.get(subscriptionKey);

  //   if (subscription) {
  //     subscription.clients.delete(client);

  //     // 해당 종목을 구독하는 클라이언트가 없으면 KIS 구독 해제
  //     if (subscription.clients.size === 0) {
  //       this.subscriptions.delete(subscriptionKey);
  //       this._unsubscribeFromKis(data.tr_id, data.tr_key);
  //     }
  //   }
  // }

  // private _subscribeToKis(tr_id: string, tr_key: string) {
  //   if (this.kisWebSocket && this.kisWebSocket.readyState === WebSocket.OPEN) {
  //     const subscribeMsg = {
  //       header: {
  //         approval_key: 'def07058-7680-4cd8-837a-0856c48bacf1',
  //         custtype: 'P',
  //         tr_type: '1',
  //         'content-type': 'utf-8',
  //       },
  //       body: {
  //         input: {
  //           tr_id: tr_id,
  //           tr_key: tr_key,
  //         },
  //       },
  //     };

  //     this.kisWebSocket.send(JSON.stringify(subscribeMsg));
  //     this.logger.log(`KIS 구독 요청: ${tr_id} - ${tr_key}`);
  //   }
  // }

  // private _unsubscribeFromKis(tr_id: string, tr_key: string) {
  //   if (this.kisWebSocket && this.kisWebSocket.readyState === WebSocket.OPEN) {
  //     const unsubscribeMsg = {
  //       header: {
  //         approval_key: 'def07058-7680-4cd8-837a-0856c48bacf1',
  //         custtype: 'P',
  //         tr_type: '2',
  //         'content-type': 'utf-8',
  //       },
  //       body: {
  //         input: {
  //           tr_id: tr_id,
  //           tr_key: tr_key,
  //         },
  //       },
  //     };

  //     this.kisWebSocket.send(JSON.stringify(unsubscribeMsg));
  //     this.logger.log(`KIS 구독 해제: ${tr_id} - ${tr_key}`);
  //   }
  // }

  // private _removeClientFromAllSubscriptions(client: Socket) {
  //   for (const [subscriptionKey, subscription] of this.subscriptions.entries()) {
  //     if (subscription.clients.has(client)) {
  //       subscription.clients.delete(client);

  //       // 해당 종목을 구독하는 클라이언트가 없으면 KIS 구독 해제
  //       if (subscription.clients.size === 0) {
  //         this.subscriptions.delete(subscriptionKey);
  //         this._unsubscribeFromKis(subscription.tr_id, subscription.tr_key);
  //       }
  //     }
  //   }
  // }

  private async _connectToKisWebSocket() {
    try {
      this.kisWebSocket = new WebSocket('ws://ops.koreainvestment.com:21000');

      this.kisWebSocket.onopen = async () => {
        const { token } = await this.kisTokenRepository.getToken();

        const messageKOSPI = {
          header: {
            approval_key: token,
            custtype: 'P',
            tr_type: '1',
            'content-type': 'utf-8',
          },
          body: {
            input: {
              tr_id: 'H0UPCNT0',
              tr_key: KOSPI,
            },
          },
        };

        const messageKOSDAQ = {
          header: {
            approval_key: token,
            custtype: 'P',
            tr_type: '1',
            'content-type': 'utf-8',
          },
          body: {
            input: {
              tr_id: 'H0UPCNT0',
              tr_key: KOSDAQ,
            },
          },
        };

        this.kisWebSocket.send(JSON.stringify(messageKOSPI));
        this.kisWebSocket.send(JSON.stringify(messageKOSDAQ));
      };

      this.kisWebSocket.onmessage = (event) => {
        try {
          // event.data를 string으로 변환
          const ret = event.data.toString();
          // this.logger.log('KIS에서 받은 원본 데이터:', data);

          const data = ret.split('|')[3]?.split('^');

          if (data) {
            //   const priceData = {
            //     symbol: data[1],
            //     localDate: data[3],
            //     localTime: data[4],
            //     koreanDate: data[5],
            //     koreanTime: data[6],
            //     bidPrice: data[11],
            //     askPrice: data[12],
            //     buyBalance: data[13],
            //     sellBalance: data[14],
            //   };

            //   this.logger.log('가격 데이터:', priceData);

            //   // 모든 구독 중인 클라이언트들에게 데이터 전송
            //   this.connectedClients.forEach((client) => {
            //     if (client.connected) {
            //       client.emit('price-update', priceData);
            //       this.logger.log(`클라이언트 ${client.id}에게 데이터 전송`);
            //     }
            //   });

            this.connectedClients.forEach((client) => {
              const [code, time, price, prev_sign, prev] = data;

              if (client.connected) {
                // client.emit('data', data);
                // this.logger.log(`클라이언트 ${client.id}에게 데이터 전송`);

                client.emit(`${code}`, { code, time, price, prev_sign, prev });
              }
            });
          }
        } catch (error) {
          this.logger.error('메시지 파싱 오류:', error);
        }
      };

      this.kisWebSocket.onerror = (error) => {
        // this.logger.error('KIS WebSocket 오류:', error);
        // this.server.emit('kis-error', { message: 'KIS WebSocket 연결 오류' });
      };

      this.kisWebSocket.onclose = (event) => {
        // this.logger.log(`KIS WebSocket 연결 종료: ${event.code} - ${event.reason}`);
        // this.server.emit('kis-disconnected');
        // 재연결 시도 (5초 후)
        // if (this.connectedClients.size > 0) {
        //   setTimeout(() => {
        //     this._connectToKisWebSocket();
        //   }, 5000);
        // }
      };
    } catch (error) {
      this.logger.error('KIS WebSocket 연결 실패:', error);
    }
  }

  private _disconnectFromKisWebSocket() {
    if (this.kisWebSocket) {
      this.logger.log('KIS WebSocket 연결 해제');
      this.kisWebSocket.close();
      this.kisWebSocket = null;
    }
  }
}
