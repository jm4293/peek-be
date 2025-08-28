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
        const { token } = await this.kisTokenRepository.getSocketToken();

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

// import { Server, Socket } from 'socket.io';
// import { WebSocket } from 'ws';

// import { Inject, Logger, OnModuleInit } from '@nestjs/common';
// import {
//   ConnectedSocket,
//   MessageBody,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';

// import { KisTokenRepository } from '@database/repositories/kis';

// const KOSPI = '0001';
// const KOSDAQ = '1001';

// interface Subscription {
//   tr_id: string;
//   tr_key: string;
//   clients: Set<Socket>;
// }

// interface ClientSubscription {
//   client: Socket;
//   stockCode?: string; // 클라이언트가 구독한 개별 종목
// }

// @WebSocketGateway({
//   cors: {
//     origin: ['http://localhost:3000', 'https://stock.peek.run'],
//     credentials: true,
//   },
//   namespace: '/realtime',
// })
// export class KisWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
//   @WebSocketServer()
//   server: Server;

//   private readonly logger = new Logger(KisWebSocketGateway.name);
//   private kisWebSocket: WebSocket | null = null;
//   private connectedClients = new Map<string, ClientSubscription>(); // clientId -> ClientSubscription
//   private stockSubscriptions = new Map<string, Subscription>(); // subscriptionKey -> Subscription
//   private isIndexSubscribed = false; // 지수 구독 여부

//   constructor(private readonly kisTokenRepository: KisTokenRepository) {}

//   async onModuleInit() {
//     this.logger.log('KIS WebSocket Gateway 초기화');
//   }

//   async handleConnection(client: Socket) {
//     this.logger.log(`클라이언트 연결: ${client.id}`);

//     this.connectedClients.set(client.id, { client });

//     // 첫 번째 클라이언트 연결 시 KIS WebSocket 연결 및 지수 구독
//     if (this.connectedClients.size === 1) {
//       await this._connectToKisWebSocket();
//     } else if (this.kisWebSocket && this.kisWebSocket.readyState === WebSocket.OPEN && !this.isIndexSubscribed) {
//       // 이미 연결되어 있지만 지수가 구독되지 않은 경우
//       await this._subscribeToIndex();
//     }
//   }

//   async handleDisconnect(client: Socket) {
//     this.logger.log(`클라이언트 연결 해제: ${client.id}`);

//     const clientSub = this.connectedClients.get(client.id);
//     if (clientSub?.stockCode) {
//       // 클라이언트가 구독한 개별 종목 해제
//       await this._removeStockSubscription(client.id, clientSub.stockCode);
//     }

//     this.connectedClients.delete(client.id);

//     // 모든 클라이언트가 연결 해제되면 KIS WebSocket 해제
//     if (this.connectedClients.size === 0) {
//       this._disconnectFromKisWebSocket();
//     }
//   }

//   @SubscribeMessage('subscribe_stock')
//   async handleSubscribeStock(@MessageBody() data: { stock_code: string }, @ConnectedSocket() client: Socket) {
//     this.logger.log(`개별 종목 구독 요청: ${client.id}, 종목코드: ${data.stock_code}`);

//     if (!this.kisWebSocket || this.kisWebSocket.readyState !== WebSocket.OPEN) {
//       client.emit('error', { message: 'KIS WebSocket이 연결되지 않았습니다.' });
//       return;
//     }

//     const clientSub = this.connectedClients.get(client.id);
//     if (!clientSub) {
//       client.emit('error', { message: '클라이언트 정보를 찾을 수 없습니다.' });
//       return;
//     }

//     // 기존에 다른 종목을 구독하고 있다면 해제
//     if (clientSub.stockCode && clientSub.stockCode !== data.stock_code) {
//       await this._removeStockSubscription(client.id, clientSub.stockCode);
//     }

//     // 새로운 종목 구독
//     await this._addStockSubscription(client.id, data.stock_code);

//     client.emit('stock_subscribed', {
//       success: true,
//       stock_code: data.stock_code,
//       message: `${data.stock_code} 구독 완료`,
//     });
//   }

//   @SubscribeMessage('unsubscribe_stock')
//   async handleUnsubscribeStock(@ConnectedSocket() client: Socket) {
//     this.logger.log(`개별 종목 구독 해제: ${client.id}`);

//     const clientSub = this.connectedClients.get(client.id);
//     if (clientSub?.stockCode) {
//       await this._removeStockSubscription(client.id, clientSub.stockCode);

//       client.emit('stock_unsubscribed', {
//         success: true,
//         stock_code: clientSub.stockCode,
//         message: `${clientSub.stockCode} 구독 해제 완료`,
//       });
//     } else {
//       client.emit('stock_unsubscribed', {
//         success: false,
//         message: '구독 중인 종목이 없습니다.',
//       });
//     }
//   }

//   private async _connectToKisWebSocket() {
//     try {
//       this.logger.log('KIS WebSocket 연결 중...');

//       this.kisWebSocket = new WebSocket('ws://ops.koreainvestment.com:21000');

//       this.kisWebSocket.onopen = async () => {
//         this.logger.log('KIS WebSocket 연결 완료');
//         await this._subscribeToIndex();
//       };

//       this.kisWebSocket.onmessage = (event) => {
//         this._handleKisMessage(event);
//       };

//       this.kisWebSocket.onerror = (error) => {
//         this.logger.error('KIS WebSocket 오류:', error);
//       };

//       this.kisWebSocket.onclose = (event) => {
//         this.logger.log('KIS WebSocket 연결 종료');
//         this.isIndexSubscribed = false;

//         // 클라이언트가 있으면 재연결 시도
//         if (this.connectedClients.size > 0) {
//           setTimeout(() => {
//             this._connectToKisWebSocket();
//           }, 5000);
//         }
//       };
//     } catch (error) {
//       this.logger.error('KIS WebSocket 연결 실패:', error);
//     }
//   }

//   private async _subscribeToIndex() {
//     if (!this.kisWebSocket || this.kisWebSocket.readyState !== WebSocket.OPEN) {
//       return;
//     }

//     try {
//       const { token } = await this.kisTokenRepository.getToken();

//       const messageKOSPI = {
//         header: {
//           approval_key: token,
//           custtype: 'P',
//           tr_type: '1',
//           'content-type': 'utf-8',
//         },
//         body: {
//           input: {
//             tr_id: 'H0UPCNT0',
//             tr_key: KOSPI,
//           },
//         },
//       };

//       const messageKOSDAQ = {
//         header: {
//           approval_key: token,
//           custtype: 'P',
//           tr_type: '1',
//           'content-type': 'utf-8',
//         },
//         body: {
//           input: {
//             tr_id: 'H0UPCNT0',
//             tr_key: KOSDAQ,
//           },
//         },
//       };

//       this.kisWebSocket.send(JSON.stringify(messageKOSPI));
//       this.kisWebSocket.send(JSON.stringify(messageKOSDAQ));

//       this.isIndexSubscribed = true;
//       this.logger.log('KOSPI, KOSDAQ 구독 완료');
//     } catch (error) {
//       this.logger.error('지수 구독 실패:', error);
//     }
//   }

//   private async _addStockSubscription(clientId: string, stockCode: string) {
//     // const tr_id = 'H0STCNT0';
//     const tr_id = 'HDFSASP0';
//     const subscriptionKey = `${tr_id}_${stockCode}`;

//     // 이미 해당 종목을 구독하는 다른 클라이언트가 있는지 확인
//     let subscription = this.stockSubscriptions.get(subscriptionKey);

//     if (!subscription) {
//       // 새로운 종목 구독
//       subscription = {
//         tr_id,
//         tr_key: stockCode,
//         clients: new Set(),
//       };
//       this.stockSubscriptions.set(subscriptionKey, subscription);

//       // KIS에 구독 요청
//       await this._subscribeToKis(tr_id, stockCode);
//       this.logger.log(`새로운 종목 KIS 구독: ${stockCode}`);
//     }

//     // 클라이언트를 구독에 추가
//     const clientSub = this.connectedClients.get(clientId);
//     if (clientSub) {
//       subscription.clients.add(clientSub.client);
//       clientSub.stockCode = stockCode;
//       this.logger.log(`클라이언트 ${clientId}가 ${stockCode} 구독`);
//     }
//   }

//   private async _removeStockSubscription(clientId: string, stockCode: string) {
//     // const tr_id = 'H0STCNT0';
//     const tr_id = 'HDFSASP0';
//     const subscriptionKey = `${tr_id}_${stockCode}`;

//     const subscription = this.stockSubscriptions.get(subscriptionKey);
//     if (!subscription) return;

//     const clientSub = this.connectedClients.get(clientId);
//     if (clientSub) {
//       subscription.clients.delete(clientSub.client);
//       clientSub.stockCode = undefined;
//     }

//     // 해당 종목을 구독하는 클라이언트가 없으면 KIS 구독 해제
//     if (subscription.clients.size === 0) {
//       this.stockSubscriptions.delete(subscriptionKey);
//       await this._unsubscribeFromKis(tr_id, stockCode);
//       this.logger.log(`종목 KIS 구독 해제: ${stockCode}`);
//     }
//   }

//   private async _subscribeToKis(tr_id: string, tr_key: string) {
//     if (!this.kisWebSocket || this.kisWebSocket.readyState !== WebSocket.OPEN) {
//       return;
//     }

//     try {
//       const { token } = await this.kisTokenRepository.getToken();

//       const subscribeMsg = {
//         header: {
//           approval_key: token,
//           custtype: 'P',
//           tr_type: '1',
//           'content-type': 'utf-8',
//         },
//         body: {
//           input: {
//             tr_id: tr_id,
//             tr_key: tr_key,
//           },
//         },
//       };

//       this.kisWebSocket.send(JSON.stringify(subscribeMsg));
//       this.logger.log(`KIS 구독 요청: ${tr_id} - ${tr_key}`);
//     } catch (error) {
//       this.logger.error(`KIS 구독 요청 실패: ${tr_id} - ${tr_key}`, error);
//     }
//   }

//   private async _unsubscribeFromKis(tr_id: string, tr_key: string) {
//     if (!this.kisWebSocket || this.kisWebSocket.readyState !== WebSocket.OPEN) {
//       return;
//     }

//     try {
//       const { token } = await this.kisTokenRepository.getToken();

//       const unsubscribeMsg = {
//         header: {
//           approval_key: token,
//           custtype: 'P',
//           tr_type: '2',
//           'content-type': 'utf-8',
//         },
//         body: {
//           input: {
//             tr_id: tr_id,
//             tr_key: tr_key,
//           },
//         },
//       };

//       this.kisWebSocket.send(JSON.stringify(unsubscribeMsg));
//       this.logger.log(`KIS 구독 해제: ${tr_id} - ${tr_key}`);
//     } catch (error) {
//       this.logger.error(`KIS 구독 해제 실패: ${tr_id} - ${tr_key}`, error);
//     }
//   }

//   private _handleKisMessage(event: any) {
//     try {
//       const ret = event.data.toString();

//       console.log('ret', ret);

//       const data = ret.split('|')[3]?.split('^');

//       if (!data || data.length === 0) return;

//       const code = data[0];

//       // 지수 데이터인지 확인 (KOSPI: 0001, KOSDAQ: 1001)
//       if (code === KOSPI || code === KOSDAQ) {
//         // 모든 연결된 클라이언트에게 지수 데이터 전송
//         this.connectedClients.forEach((clientSub) => {
//           if (clientSub.client.connected) {
//             clientSub.client.emit('index_data', {
//               type: code === KOSPI ? 'KOSPI' : 'KOSDAQ',
//               code: code,
//               time: data[1],
//               price: data[2],
//               prev_sign: data[3],
//               prev: data[4],
//               raw_data: data,
//             });
//           }
//         });
//       } else {
//         // 개별 종목 데이터 처리
//         // const subscriptionKey = `H0STCNT0_${code}`;
//         const subscriptionKey = `HDFSASP0_${code}`;
//         const subscription = this.stockSubscriptions.get(subscriptionKey);

//         if (subscription) {
//           subscription.clients.forEach((client) => {
//             if (client.connected) {
//               // client.emit('stock_data', {
//               //   stock_code: code,
//               //   time: data[1],
//               //   price: data[2],
//               //   prev_sign: data[3],
//               //   prev: data[4],
//               //   volume: data[5] || '0',
//               //   raw_data: data,
//               // });
//               client.emit('stock_data', {
//                 stock_code: code[1],
//                 time: data[3],
//                 price: data[12],
//                 prev_sign: data[2],
//                 prev: data[4],
//                 volume: data[5] || '0',
//                 raw_data: data,
//               });
//             }
//           });
//         }
//       }
//     } catch (error) {
//       this.logger.error('KIS 메시지 파싱 오류:', error);
//     }
//   }

//   private _disconnectFromKisWebSocket() {
//     if (this.kisWebSocket) {
//       this.logger.log('KIS WebSocket 연결 해제');
//       this.kisWebSocket.close();
//       this.kisWebSocket = null;
//       this.isIndexSubscribed = false;
//       this.stockSubscriptions.clear();
//     }
//   }
// }
