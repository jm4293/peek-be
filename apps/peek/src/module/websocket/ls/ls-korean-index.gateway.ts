import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { StockKoreanIndexTypeEnum } from '@constant/enum/stock';
import { TokenProviderEnum } from '@constant/enum/token';

import { StockKoreanIndexRepository } from '@database/repositories/stock';
import { TokenRepository } from '@database/repositories/token';

interface IIndex {
  time: string; // 시간
  jisu: string; // 지수
  sign: string; // 전일대비구분
  change: string; // 전일비
  drate: string; // 등락율
  cvolume: string; // 체결량
  volume: string; // 거래량
  value: string; // 거래대금
  upjo: string; // 상한종목수
  highjo: string; // 상승종목수
  unchgjo: string; // 보합종목수
  lowjo: string; // 하락종목수
  downjo: string; // 하한종목수
  upjrate: string; // 상승종목비율
  openjisu: string; // 시가지수
  opentime: string; // 시가시간
  highjisu: string; // 고가지수
  hightime: string; // 고가시간
  lowjisu: string; // 저가지수
  lowtime: string; // 저가시간
  frgsvolume: string; // 외인순매수수량
  orgsvolume: string; // 기관순매수수량
  frgsvalue: string; // 외인순매수금액
  orgsvalue: string; // 기관순매수금액
  upcode: string; // 업종코드
}

const KOSPI_TR_KEY = '001';
const KOSDAQ_TR_KEY = '301';

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'https://stock.peek.run'] },
  namespace: '/ls/korean/index',
})
export class LsKoreanIndexGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LsKoreanIndexGateway.name);
  private lsWebSocket: WebSocket | null = null;
  private lsWebSocketToken: string | null = null;
  private kospiIndex = null;
  private kosdaqIndex = null;

  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(
    private readonly configService: ConfigService,

    private readonly tokenRepository: TokenRepository,
    private readonly stockKoreanIndexRepository: StockKoreanIndexRepository,
  ) {}

  async onModuleInit() {
    await this._initKoreanIndex();

    if (this.configService.get('NODE_ENV') === 'production') {
      await this._setLsToken();
      await this._connectToLs();

      this.logger.log(`LS WebSocket token initialized: ${this.lsWebSocketToken}`);
    }
  }

  async handleConnection(client: Socket) {
    this.logger.log(`LS 클라이언트 연결: ${client.id}`);

    client.emit(KOSPI_TR_KEY, this.kospiIndex);
    client.emit(KOSDAQ_TR_KEY, this.kosdaqIndex);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`LS 클라이언트 연결 해제: ${client.id}`);
  }

  private async _connectToLs() {
    try {
      this.lsWebSocket = new WebSocket('wss://openapi.ls-sec.co.kr:9443/websocket');
    } catch (error) {
      this.logger.error('LS WebSocket 연결 실패:', error);
      return;
    }

    this.lsWebSocket.onopen = async () => {
      if (!this.lsWebSocketToken) {
        await this._setLsToken();
      }

      this.reconnectAttempts = 0;

      try {
        const messageKOSPI = {
          header: {
            token: `${this.lsWebSocketToken}`,
            tr_type: '3',
          },
          body: {
            tr_cd: 'IJ_',
            tr_key: KOSPI_TR_KEY,
          },
        };

        const messageKOSDAQ = {
          header: {
            token: `${this.lsWebSocketToken}`,
            tr_type: '3',
          },
          body: {
            tr_cd: 'IJ_',
            tr_key: KOSDAQ_TR_KEY,
          },
        };

        const messageNWS = {
          header: {
            token: `${this.lsWebSocketToken}`,
            tr_type: '3',
          },
          body: {
            tr_cd: 'NWS',
            tr_key: 'NWS001',
          },
        };

        this.lsWebSocket.send(JSON.stringify(messageKOSPI));
        this.lsWebSocket.send(JSON.stringify(messageKOSDAQ));
        // this.lsWebSocket.send(JSON.stringify(messageNWS));
      } catch (error) {
        this.logger.error('LS onopen 핸들러에서 오류 발생:', error);
        this.lsWebSocket.close();
      }
    };

    this.lsWebSocket.onmessage = (event) => {
      try {
        const ret = event.data.toString();

        const { header, body } = JSON.parse(ret);

        if (body) {
          const { tr_cd, tr_key } = header;

          if (tr_key === KOSPI_TR_KEY) {
            this.kospiIndex = body;

            this.server.emit(KOSPI_TR_KEY, this.kospiIndex);

            this.stockKoreanIndexRepository.save({
              type: StockKoreanIndexTypeEnum.KOSPI,
              ...body,
            });
          }

          if (tr_key === KOSDAQ_TR_KEY) {
            this.kosdaqIndex = body;

            this.server.emit(KOSDAQ_TR_KEY, this.kosdaqIndex);

            this.stockKoreanIndexRepository.save({
              type: StockKoreanIndexTypeEnum.KOSDAQ,
              ...body,
            });
          }
        }
      } catch (error) {
        this.logger.error('LS onmessage 핸들러에서 오류 발생:', error);
      }
    };

    this.lsWebSocket.onerror = (error) => {
      this.logger.error('LS WebSocket 오류:', error);
    };

    this.lsWebSocket.onclose = (event) => {
      this.logger.log(`LS WebSocket 연결 종료: ${event.code} - ${event.reason}`);

      if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts++;

        setTimeout(() => {
          this._connectToLs();
        }, 3000);
      } else {
        this.logger.error('LS WebSocket 최대 재연결 시도 횟수 초과');
      }
    };
  }

  private async _setLsToken() {
    try {
      const ret = await this.tokenRepository.getOAuthToken(TokenProviderEnum.LS);

      this.lsWebSocketToken = ret.token;

      this.logger.log('LS 토큰 갱신 완료');
    } catch (error) {
      this.logger.error('LS 토큰 갱신 실패:', error);

      throw error;
    }
  }

  private async _initKoreanIndex() {
    const kospiIndex = await this.stockKoreanIndexRepository.findOne({
      where: { type: StockKoreanIndexTypeEnum.KOSPI },
      order: { createdAt: 'DESC' },
    });
    const kosdaqIndex = await this.stockKoreanIndexRepository.findOne({
      where: { type: StockKoreanIndexTypeEnum.KOSDAQ },
      order: { createdAt: 'DESC' },
    });

    this.kospiIndex = kospiIndex;
    this.kosdaqIndex = kosdaqIndex;
  }
}
