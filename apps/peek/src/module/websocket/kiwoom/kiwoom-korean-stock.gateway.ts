import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { SecuritiesTokenRepository } from '@libs/database/repositories/stock';

import { TokenProvider } from '@libs/shared/const/token';

interface IStockPrice {
  symbol: string; // 종목 코드 (예: 005930)
  name: string; // 종목명 (예: 삼성전자)
  price: number; // 현재가
  change: number; // 전일대비
  changeRate: number; // 등락률
  volume: number; // 거래량
  timestamp: Date;
}

// 키움 웹소켓에서 받는 데이터 구조 (실제 키움 API에 맞게 수정 필요)
interface IKiwoomStockData {
  tr_id: string;
  tr_key: string; // 종목코드
  prpr: string; // 현재가
  prdy_vrss: string; // 전일대비
  prdy_ctrt: string; // 등락률
  acml_vol: string; // 누적거래량
  hts_kor_isnm: string; // 종목명
  stck_prpr: string; // 주식현재가
  prdy_vrss_sign: string; // 전일대비부호
  prdy_vrss_ctrt: string; // 전일대비등락률
}

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'https://stock.peek.run'] },
  namespace: '/kiwoom/korean/stock',
})
export class KiwoomKoreanStockGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KiwoomKoreanStockGateway.name);
  private kiwoomSocket: WebSocket | null = null;
  private kiwoomSocketToken: string | null = null;

  // Socket.IO room 기능을 사용하므로 수동 채널 관리 제거
  private stockPrices = new Map<string, IStockPrice>(); // 종목코드 -> 최신 가격 정보
  private subscribedStocks = new Set<string>(); // 구독 중인 종목들

  // private reconnectAttempts = 0;
  // private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(
    private readonly configService: ConfigService,
    private readonly securitiesTokenRepository: SecuritiesTokenRepository,
  ) {}

  async onModuleInit() {
    if (this.configService.get('NODE_ENV') === 'production') {
      await this._setKiwoomToken();
      await this._connectToKiwoom();
    }
  }

  async handleConnection(client: Socket) {
    client.emit('connected', true);
    this.logger.log(`웹소켓 KIWOOM 한국 주식 클라이언트 연결: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`웹소켓 KIWOOM 한국 주식 클라이언트 연결 해제: ${client.id}`);
  }

  @SubscribeMessage('subscribe_stock')
  async handleSubscribeStock(@MessageBody() data: { symbol: string }, @ConnectedSocket() client: Socket) {
    const { symbol } = data;

    if (!symbol) {
      client.emit('error', { message: '웹소켓 KIWOOM 한국 주식 종목 코드가 필요합니다.' });
      return;
    }

    // Socket.IO room에 클라이언트 추가
    const roomName = `stock_${symbol}`;
    await client.join(roomName);

    // 최신 가격 정보가 있으면 클라이언트에게 전송
    const latestPrice = this.stockPrices.get(symbol);
    if (latestPrice) {
      client.emit(roomName, latestPrice);
    }

    // room에 있는 클라이언트 수 확인
    // const roomSize = this.server.sockets.adapter.rooms.get(roomName)?.size || 0;
    this.logger.log(`웹소켓 KIWOOM 한국 주식 클라이언트 ${client.id}가 종목 ${symbol} 구독 `);

    // 키움 웹소켓에 종목 구독 요청 (처음 구독하는 종목인 경우)
    if (!this.subscribedStocks.has(symbol)) {
      await this._subscribeToKiwoomStock(symbol);
    }

    client.emit('subscribed', { symbol, message: `${symbol} 종목을 구독했습니다.` });
  }

  @SubscribeMessage('unsubscribe_stock')
  async handleUnsubscribeStock(@MessageBody() data: { symbol: string }, @ConnectedSocket() client: Socket) {
    const { symbol } = data;

    if (!symbol) {
      client.emit('error', { message: '종목 코드가 필요합니다.' });
      return;
    }

    // Socket.IO room에서 클라이언트 제거
    const roomName = `stock_${symbol}`;
    await client.leave(roomName);

    // room에 남은 클라이언트 수 확인
    // const roomSize = this.server.sockets.adapter.rooms.get(roomName)?.size || 0;
    this.logger.log(`웹소켓 KIWOOM 한국 주식 클라이언트 ${client.id}가 종목 ${symbol} 구독 해제`);

    // 더 이상 구독자가 없으면 키움 웹소켓에서 구독 해제
    // if (roomSize === 0) {
    await this._unsubscribeFromKiwoomStock(symbol);
    // }

    client.emit('unsubscribed', { symbol, message: `${symbol} 종목 구독을 해제했습니다.` });
  }

  private _updateStockPrice(stockData: IStockPrice) {
    const { symbol } = stockData;

    // 최신 가격 정보 저장
    this.stockPrices.set(symbol, stockData);

    // 해당 종목 room의 모든 클라이언트에게 실시간 데이터 전송
    const roomName = `stock_${symbol}`;
    const roomSize = this.server.sockets.adapter.rooms.get(roomName)?.size || 0;

    if (roomSize > 0) {
      this.server.to(roomName).emit(roomName, stockData);
      this.logger.log(`종목 ${symbol} 가격 업데이트: ${stockData.price}원 (구독자 ${roomSize}명)`);
    }
  }

  private async _connectToKiwoom() {
    try {
      this.kiwoomSocket = new WebSocket('wss://api.kiwoom.com:10000/api/dostk/websocket');
    } catch (error) {
      this.logger.error('웹소켓 KIWOOM 한국 주식 연결 실패:', error);
    }

    this.kiwoomSocket.onopen = async () => {
      if (this.kiwoomSocketToken) {
        const authMessage = {
          trnm: 'LOGIN',
          token: this.kiwoomSocketToken,
        };

        this.kiwoomSocket.send(JSON.stringify(authMessage));
      }
    };

    this.kiwoomSocket.onmessage = (event) => {
      try {
        const ret = JSON.parse(event.data.toString());

        const { trnm, return_code } = ret;

        if (trnm === 'LOGIN') {
          if (return_code !== 0) {
            this.logger.error('웹소켓 kiwoom 한국 주식 로그인 실패');
          } else {
            this.logger.log('웹소켓 kiwoom 한국 주식 로그인 성공');
          }

          return;
        }

        // kiwoom 웹소켓 연결 유지를 위해 PING 메시지 송신
        if (trnm === 'PING') {
          this.kiwoomSocket.send(JSON.stringify(ret));
          return;
        }

        if (trnm === 'REG') {
          this.logger.log('웹소켓 KIWOOM 한국 주식 구독 요청 수신');
          return;
        }

        if (trnm !== 'PING') {
          const arr = ret.data;

          arr.forEach((el) => {
            const { values, item } = el;

            // item 종목명을 구독하고있는 클라이언트한데 value를 전달하는 방법
            this.server.to(`stock_${item}`).emit(`stock_${item}`, values);
          });
        }
      } catch (error) {
        this.logger.error('웹소켓 KIWOOM 한국 주식 메시지 파싱 오류');
      }
    };

    this.kiwoomSocket.onerror = (error) => {
      this.logger.error('웹소켓 KIWOOM 한국 주식 오류');
    };

    this.kiwoomSocket.onclose = (event) => {
      this.logger.log(`웹소켓 KIWOOM 한국 주식 연결 종료`);
    };
  }

  private _handleKiwoomMessage(data: IKiwoomStockData) {
    try {
      const { tr_key, prpr, prdy_vrss, prdy_ctrt, acml_vol, hts_kor_isnm } = data;

      // 종목 데이터 변환
      const stockPrice: IStockPrice = {
        symbol: tr_key,
        name: hts_kor_isnm || '',
        price: parseFloat(prpr) || 0,
        change: parseFloat(prdy_vrss) || 0,
        changeRate: parseFloat(prdy_ctrt) || 0,
        volume: parseInt(acml_vol) || 0,
        timestamp: new Date(),
      };

      // 업데이트된 주식 가격을 구독자들에게 전달
      this._updateStockPrice(stockPrice);
    } catch (error) {
      this.logger.error('키움 웹소켓 메시지 처리 오류:', error);
    }
  }

  private async _subscribeToKiwoomStock(symbol: string) {
    if (!this.kiwoomSocket || this.kiwoomSocket.readyState !== WebSocket.OPEN) {
      this.logger.warn(`키움 웹소켓이 연결되지 않아 종목 ${symbol} 구독 실패`);
      return;
    }

    try {
      // 키움 웹소켓에 종목 구독 요청 (실제 키움 API에 맞게 수정 필요)
      // const subscribeMessage = {
      //   header: {
      //     token: this.kiwoomSocketToken,
      //     tr_type: '3', // 실시간 데이터 구독
      //   },
      //   body: {
      //     tr_id: 'H0STCNT0', // 주식현재가 실시간 조회
      //     tr_key: symbol,
      //   },
      // };

      const subscribeMessage = {
        trnm: 'REG',
        grp_no: '1',
        refresh: '1',
        data: [
          {
            item: ['005930'],
            type: ['0D'],
          },
        ],
      };

      this.kiwoomSocket.send(JSON.stringify(subscribeMessage));
      this.subscribedStocks.add(symbol);

      this.logger.log(`키움 웹소켓에서 종목 ${symbol} 구독 요청 전송`);
    } catch (error) {
      this.logger.error(`종목 ${symbol} 구독 요청 실패:`, error);
    }
  }

  private async _unsubscribeFromKiwoomStock(symbol: string) {
    if (!this.kiwoomSocket || this.kiwoomSocket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const unsubscribeMessage = {
        trnm: 'REMOVE',
        grp_no: '1',
        refresh: '1',
        data: [
          {
            item: ['005930'],
            type: ['0D'],
          },
        ],
      };

      this.kiwoomSocket.send(JSON.stringify(unsubscribeMessage));
      this.subscribedStocks.delete(symbol);

      this.logger.log(`키움 웹소켓에서 종목 ${symbol} 구독 해제 요청 전송`);
    } catch (error) {
      this.logger.error(`종목 ${symbol} 구독 해제 요청 실패:`, error);
    }
  }

  private async _setKiwoomToken() {
    try {
      const ret = await this.securitiesTokenRepository.getOAuthToken(TokenProvider.KIWOOM);

      this.kiwoomSocketToken = ret.token;

      this.logger.log('웹소켓 KIWOOM 한국 주식 토큰 불러오기 성공');
    } catch (error) {
      this.logger.error('웹소켓 KIWOOM 한국 주식 토큰 불러오기 실패');

      throw error;
    }
  }
}
