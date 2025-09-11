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

import { TokenProviderEnum } from '@constant/enum/token';

import { TokenRepository } from '@database/repositories/token';

interface IStockPrice {
  symbol: string; // 종목 코드 (예: 005930)
  name: string; // 종목명 (예: 삼성전자)
  price: number; // 현재가
  change: number; // 전일대비
  changeRate: number; // 등락률
  volume: number; // 거래량
  timestamp: Date;
}

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'https://stock.peek.run'] },
  namespace: '/kiwoom/korean/stock',
})
export class KiwoomStockGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KiwoomStockGateway.name);
  private kiwoomWebSocketToken: string | null = null;
  private kiwoomWebSocket: WebSocket | null = null;

  private stockChannels = new Map<string, Set<string>>(); // 종목코드 -> 연결된 클라이언트 ID들
  private stockPrices = new Map<string, IStockPrice>(); // 종목코드 -> 최신 가격 정보

  constructor(
    private readonly configService: ConfigService,

    private readonly tokenRepository: TokenRepository,
  ) {}

  async onModuleInit() {
    if (this.configService.get('NODE_ENV') === 'production') {
      await this._setKiwoomToken();
    }
  }

  async handleConnection(client: Socket) {
    this.logger.log(`웹소켓 KIWOOM 한국 주식 클라이언트 연결: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`웹소켓 KIWOOM 한국 주식 클라이언트 연결 해제: ${client.id}`);

    // 연결 해제된 클라이언트를 모든 채널에서 제거
    this.stockChannels.forEach((clients, symbol) => {
      clients.delete(client.id);

      if (clients.size === 0) {
        this.stockChannels.delete(symbol);
        this.logger.log(`웹소켓 KIWOOM 한국 주식 종목 ${symbol} 채널이 비어있어 제거됨`);
      }
    });
  }

  @SubscribeMessage('subscribe_stock')
  async handleSubscribeStock(@MessageBody() data: { symbol: string }, @ConnectedSocket() client: Socket) {
    const { symbol } = data;

    if (!symbol) {
      client.emit('error', { message: '웹소켓 KIWOOM 한국 주식 종목 코드가 필요합니다.' });
      return;
    }

    if (!this.stockChannels.has(symbol)) {
      this.stockChannels.set(symbol, new Set());
    }

    this.stockChannels.get(symbol).add(client.id);

    const latestPrice = this.stockPrices.get(symbol);

    if (latestPrice) {
      client.emit(`stock_${symbol}`, latestPrice);
    }

    this.logger.log(`웹소켓 KIWOOM 한국 주식 클라이언트 ${client.id}가 종목 ${symbol} 구독`);

    client.emit('subscribed', { symbol, message: `${symbol} 종목을 구독했습니다.` });
  }

  @SubscribeMessage('unsubscribe_stock')
  async handleUnsubscribeStock(@MessageBody() data: { symbol: string }, @ConnectedSocket() client: Socket) {
    const { symbol } = data;

    if (!symbol) {
      client.emit('error', { message: '종목 코드가 필요합니다.' });
      return;
    }

    const clients = this.stockChannels.get(symbol);

    if (clients) {
      clients.delete(client.id);

      if (clients.size === 0) {
        this.stockChannels.delete(symbol);
        this.logger.log(`웹소켓 KIWOOM 한국 주식 종목 ${symbol} 채널이 비어있어 제거됨`);
      }
    }

    this.logger.log(`웹소켓 KIWOOM 한국 주식 클라이언트 ${client.id}가 종목 ${symbol} 구독 해제`);

    client.emit('unsubscribed', { symbol, message: `${symbol} 종목 구독을 해제했습니다.` });
  }

  //   public updateStockPrice(stockData: IStockPrice) {
  //     const { symbol } = stockData;

  //     // 최신 가격 정보 저장
  //     this.stockPrices.set(symbol, stockData);

  //     // 해당 종목을 구독하고 있는 클라이언트들에게 실시간 데이터 전송
  //     const subscribers = this.stockChannels.get(symbol);
  //     if (subscribers && subscribers.size > 0) {
  //       this.server.emit(`stock_${symbol}`, stockData);
  //       this.logger.log(`종목 ${symbol} 가격 업데이트: ${stockData.price}원 (구독자 ${subscribers.size}명)`);
  //     }
  //   }

  private async _connectToKiwoom() {}

  private async _setKiwoomToken() {
    try {
      const ret = await this.tokenRepository.getOAuthToken(TokenProviderEnum.KIWOOM);

      this.kiwoomWebSocketToken = ret.token;

      this.logger.log('웹소켓 KIWOOM 한국 주식 토큰 불러오기 성공');
    } catch (error) {
      this.logger.error('웹소켓 KIWOOM 한국 주식 토큰 불러오기 실패');

      throw error;
    }
  }
}
