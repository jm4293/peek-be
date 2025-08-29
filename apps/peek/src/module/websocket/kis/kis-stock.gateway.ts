// import { Server, Socket } from 'socket.io';
// import { WebSocket } from 'ws';

// import { Logger, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';

// import { KisTokenRepository } from '@database/repositories/kis';

// interface Subscription {
//   tr_key: string;
//   clients: Set<Socket>;
// }

// @WebSocketGateway({
//   cors: {
//     origin: ['http://localhost:3000', 'https://stock.peek.run'],
//   },
//   namespace: '/kis/korean/stock',
// })
// export class KisStockGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private readonly logger = new Logger(KisStockGateway.name);
//   private readonly TR_ID = 'H0STCNT0'; // tr_id 상수로 정의
//   private kisWebSocket: WebSocket | null = null;
//   private kisWebSocketToken: string | null = null;
//   private clientList: Set<Socket> = new Set();
//   private roomList: Map<string, Subscription> = new Map();
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;
//   private reconnectDelay = 5000; // 5초

//   constructor(
//     private readonly configService: ConfigService,

//     private readonly kisTokenRepository: KisTokenRepository,
//   ) {}

//   async onModuleInit() {
//     await this._setKisToken();
//     await this._connectToKis();
//   }

//   async handleConnection(client: Socket) {
//     this.logger.log(`클라이언트 연결: ${client.id}`);
//     this.clientList.add(client);
//   }

//   async handleDisconnect(client: Socket) {
//     this.logger.log(`클라이언트 연결 해제: ${client.id}`);
//     this.clientList.delete(client);

//     // 해당 클라이언트가 구독중인 모든 룸에서 제거
//     this._removeClientFromAllRooms(client);
//   }

//   @SubscribeMessage('subscribe')
//   async handleSubscribe(client: Socket, payload: { tr_key: string }) {
//     try {
//       this.logger.log(`클라이언트 구독: ${client.id}, ${JSON.stringify(payload)}`);
//       const { tr_key } = payload;

//       let subscription = this.roomList.get(tr_key);

//       if (!subscription) {
//         // 새로운 룸 생성
//         subscription = { tr_key, clients: new Set() };
//         this.roomList.set(tr_key, subscription);

//         // KIS에 해당 종목 실시간 데이터 구독 요청
//         await this._registerStockToKis(tr_key);
//         this.logger.log(`새로운 룸 생성 및 KIS 구독: ${tr_key}`);
//       }

//       // 클라이언트를 룸에 추가
//       subscription.clients.add(client);
//       this.logger.log(`클라이언트 ${client.id}를 룸 ${tr_key}에 추가 (총 ${subscription.clients.size}명)`);

//       // 구독 성공 응답
//       client.emit('subscribed', { tr_key, success: true });
//     } catch (error) {
//       this.logger.error(`구독 처리 중 오류: ${error.message}`);
//       client.emit('subscribed', { tr_key: payload.tr_key, success: false, error: error.message });
//     }
//   }

//   @SubscribeMessage('unsubscribe')
//   async handleUnsubscribe(client: Socket, payload: { tr_key: string }) {
//     try {
//       this.logger.log(`클라이언트 구독 해제: ${client.id}, ${JSON.stringify(payload)}`);
//       const { tr_key } = payload;

//       const subscription = this.roomList.get(tr_key);

//       if (subscription) {
//         subscription.clients.delete(client);
//         this.logger.log(`클라이언트 ${client.id}를 룸 ${tr_key}에서 제거 (남은 ${subscription.clients.size}명)`);

//         // 룸에 클라이언트가 없으면 룸 삭제 및 KIS 구독 해제
//         if (subscription.clients.size === 0) {
//           this.roomList.delete(tr_key);
//           await this._removeStockFromKis(tr_key);
//           this.logger.log(`룸 ${tr_key} 삭제 및 KIS 구독 해제`);
//         }
//       }

//       // 구독 해제 성공 응답
//       client.emit('unsubscribed', { tr_key, success: true });
//     } catch (error) {
//       this.logger.error(`구독 해제 처리 중 오류: ${error.message}`);
//       client.emit('unsubscribed', { tr_key: payload.tr_key, success: false, error: error.message });
//     }
//   }

//   private async _connectToKis() {
//     try {
//       this.kisWebSocket = new WebSocket('ws://ops.koreainvestment.com:21000');

//       this.kisWebSocket.onopen = () => {
//         this.logger.log('KIS WebSocket 연결 성공');
//         this.reconnectAttempts = 0;
//       };

//       this.kisWebSocket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data.toString());
//           this._handleKisMessage(data);
//         } catch (error) {
//           this.logger.error('KIS 메시지 파싱 오류:', error);
//         }
//       };

//       this.kisWebSocket.onerror = (error) => {
//         this.logger.error('KIS WebSocket 오류:', error);
//       };

//       this.kisWebSocket.onclose = (event) => {
//         this.logger.warn(`KIS WebSocket 연결 끊김: ${event.code} ${event.reason}`);
//         this._handleKisDisconnection();
//       };
//     } catch (error) {
//       this.logger.error('KIS WebSocket 연결 실패:', error);
//       this._handleKisDisconnection();
//     }
//   }

//   private _handleKisMessage(data: any) {
//     try {
//       // KIS에서 받은 데이터 구조에 따라 파싱
//       const tr_key = this._extractTrKeyFromKisData(data);

//       if (!tr_key) {
//         this.logger.warn('tr_key를 찾을 수 없는 메시지:', data);
//         return;
//       }

//       const subscription = this.roomList.get(tr_key);

//       if (subscription && subscription.clients.size > 0) {
//         // 해당 룸의 모든 클라이언트에게 데이터 전송
//         subscription.clients.forEach((client) => {
//           if (client.connected) {
//             client.emit('stock_data', {
//               tr_key,
//               data: data,
//             });
//           }
//         });

//         this.logger.debug(`룸 ${tr_key}의 ${subscription.clients.size}명에게 데이터 전송`);
//       }
//     } catch (error) {
//       this.logger.error('KIS 메시지 처리 중 오류:', error);
//     }
//   }

//   private _extractTrKeyFromKisData(data: any): string | null {
//     // KIS 데이터 구조에 따라 tr_key 추출 로직 구현
//     // 실제 KIS API 문서를 참조하여 구현해야 함
//     if (data?.body?.output?.tr_key) {
//       return data.body.output.tr_key;
//     }
//     if (data?.header?.tr_key) {
//       return data.header.tr_key;
//     }
//     // 기타 가능한 경로들...
//     return null;
//   }

//   private _handleKisDisconnection() {
//     if (this.reconnectAttempts < this.maxReconnectAttempts) {
//       this.reconnectAttempts++;
//       this.logger.log(`KIS WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

//       setTimeout(async () => {
//         await this._setKisToken(); // 토큰 갱신
//         await this._connectToKis();

//         // 기존 구독 복구
//         if (this.roomList.size > 0) {
//           this._restoreSubscriptions();
//         }
//       }, this.reconnectDelay);
//     } else {
//       this.logger.error('KIS WebSocket 최대 재연결 시도 횟수 초과');
//       // 모든 클라이언트에게 연결 끊김 알림
//       this.clientList.forEach((client) => {
//         client.emit('error', { message: 'KIS 서버 연결이 끊어졌습니다.' });
//       });
//     }
//   }

//   private async _restoreSubscriptions() {
//     this.logger.log(`기존 구독 ${this.roomList.size}개 복구 중...`);

//     for (const [tr_key, subscription] of this.roomList) {
//       if (subscription.clients.size > 0) {
//         await this._registerStockToKis(tr_key);
//         this.logger.log(`구독 복구: ${tr_key}`);
//       }
//     }
//   }

//   private _removeClientFromAllRooms(client: Socket) {
//     const roomsToDelete: string[] = [];

//     this.roomList.forEach((subscription, tr_key) => {
//       if (subscription.clients.has(client)) {
//         subscription.clients.delete(client);
//         this.logger.log(`연결 해제된 클라이언트를 룸 ${tr_key}에서 제거`);

//         if (subscription.clients.size === 0) {
//           roomsToDelete.push(tr_key);
//         }
//       }
//     });

//     // 빈 룸들 삭제 및 KIS 구독 해제
//     roomsToDelete.forEach(async (tr_key) => {
//       this.roomList.delete(tr_key);
//       await this._removeStockFromKis(tr_key);
//       this.logger.log(`빈 룸 ${tr_key} 삭제 및 KIS 구독 해제`);
//     });
//   }

//   private async _setKisToken() {
//     try {
//       const ret = await this.kisTokenRepository.getSocketToken();
//       this.kisWebSocketToken = ret.token;
//       this.logger.log('KIS 토큰 갱신 완료');
//     } catch (error) {
//       this.logger.error('KIS 토큰 갱신 실패:', error);
//       throw error;
//     }
//   }

//   private async _registerStockToKis(tr_key: string) {
//     if (!this.kisWebSocket || this.kisWebSocket.readyState !== WebSocket.OPEN) {
//       this.logger.warn('KIS WebSocket이 연결되지 않음');
//       return;
//     }

//     if (!this.kisWebSocketToken) {
//       await this._setKisToken();
//     }

//     const message = {
//       header: {
//         approval_key: this.kisWebSocketToken,
//         custtype: 'P',
//         tr_type: '1',
//         'content-type': 'utf-8',
//       },
//       body: {
//         input: {
//           tr_id: this.TR_ID,
//           tr_key,
//         },
//       },
//     };

//     try {
//       this.kisWebSocket.send(JSON.stringify(message));
//       this.logger.log(`KIS에 종목 구독 요청: ${tr_key}`);
//     } catch (error) {
//       this.logger.error(`KIS 구독 요청 실패: ${tr_key}`, error);
//       throw error;
//     }
//   }

//   private async _removeStockFromKis(tr_key: string) {
//     if (!this.kisWebSocket || this.kisWebSocket.readyState !== WebSocket.OPEN) {
//       this.logger.warn('KIS WebSocket이 연결되지 않음');
//       return;
//     }

//     if (!this.kisWebSocketToken) {
//       await this._setKisToken();
//     }

//     const message = {
//       header: {
//         approval_key: this.kisWebSocketToken,
//         custtype: 'P',
//         tr_type: '2',
//         'content-type': 'utf-8',
//       },
//       body: {
//         input: {
//           tr_id: this.TR_ID,
//           tr_key,
//         },
//       },
//     };

//     try {
//       this.kisWebSocket.send(JSON.stringify(message));
//       this.logger.log(`KIS에 종목 구독 해제 요청: ${tr_key}`);
//     } catch (error) {
//       this.logger.error(`KIS 구독 해제 요청 실패: ${tr_key}`, error);
//       throw error;
//     }
//   }

//   // 디버깅용 메서드들
//   @SubscribeMessage('get_rooms')
//   handleGetRooms(client: Socket) {
//     const rooms = Array.from(this.roomList.entries()).map(([tr_key, subscription]) => ({
//       tr_key,
//       clientCount: subscription.clients.size,
//     }));

//     client.emit('rooms_info', {
//       totalRooms: this.roomList.size,
//       totalClients: this.clientList.size,
//       rooms,
//     });
//   }
// }
