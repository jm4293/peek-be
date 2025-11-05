import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { StockKoreanIndexTypeEnum } from '@constant/enum/stock';
import { TokenProviderEnum } from '@constant/enum/token';

import { SecuritiesTokenRepository, StockKoreanIndexHistoryRepository } from '@database/repositories/stock';

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

  constructor(
    private readonly configService: ConfigService,

    private readonly securitiesTokenRepository: SecuritiesTokenRepository,
    private readonly stockKoreanIndexHistoryRepository: StockKoreanIndexHistoryRepository,
  ) {}

  async onModuleInit() {
    await this._initKoreanIndex();

    await this._setLsToken();
    await this.connectToLs();
  }

  async handleConnection(client: Socket) {
    this.logger.log(`LS 클라이언트 연결: ${client.id}`);

    client.emit(KOSPI_TR_KEY, this.kospiIndex);
    client.emit(KOSDAQ_TR_KEY, this.kosdaqIndex);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`LS 클라이언트 연결 해제: ${client.id}`);
  }

  async connectToLs() {
    this.lsWebSocket = new WebSocket('wss://openapi.ls-sec.co.kr:9443/websocket');

    this.lsWebSocket.onopen = async () => {
      //   const messageKOSPI = {
      //     header: {
      //       token: `${this.lsWebSocketToken}`,
      //       tr_type: '3',
      //     },
      //     body: {
      //       tr_cd: 'IJ_',
      //       tr_key: KOSPI_TR_KEY,
      //     },
      //   };

      //   const messageKOSDAQ = {
      //     header: {
      //       token: `${this.lsWebSocketToken}`,
      //       tr_type: '3',
      //     },
      //     body: {
      //       tr_cd: 'IJ_',
      //       tr_key: KOSDAQ_TR_KEY,
      //     },
      //   };

      //   this.lsWebSocket.send(JSON.stringify(messageKOSPI));
      //   this.lsWebSocket.send(JSON.stringify(messageKOSDAQ));

      const nxtSamsung = {
        header: {
          token: `${this.lsWebSocketToken}`,
          tr_type: '3',
        },
        body: {
          tr_cd: 'NS3',
          tr_key: 'N005930   ',
        },
      };

      this.lsWebSocket.send(JSON.stringify(nxtSamsung));

      this.logger.log('웹소켓 LS 한국 지수 연결 성공');
    };

    this.lsWebSocket.onmessage = (event) => {
      const ret = event.data.toString();

      const { header, body } = JSON.parse(ret);

      console.log('LS KOREAN INDEX WEBSOCKET MESSAGE:', ret);

      if (body) {
        const { tr_cd, tr_key } = header;

        if (tr_key === KOSPI_TR_KEY) {
          this.kospiIndex = body;

          this.server.emit(KOSPI_TR_KEY, this.kospiIndex);

          this.stockKoreanIndexHistoryRepository.save({
            type: StockKoreanIndexTypeEnum.KOSPI,
            ...body,
          });
        }

        if (tr_key === KOSDAQ_TR_KEY) {
          this.kosdaqIndex = body;

          this.server.emit(KOSDAQ_TR_KEY, this.kosdaqIndex);

          this.stockKoreanIndexHistoryRepository.save({
            type: StockKoreanIndexTypeEnum.KOSDAQ,
            ...body,
          });
        }
      }
    };

    this.lsWebSocket.onerror = (error) => {
      this.logger.error('LS WebSocket 오류:', error);
    };

    this.lsWebSocket.onclose = (event) => {
      this.logger.log(`LS WebSocket 연결 종료: ${event.code} - ${event.reason}`);
    };
  }

  private async _setLsToken() {
    try {
      const ret = await this.securitiesTokenRepository.getOAuthToken(TokenProviderEnum.LS);

      this.lsWebSocketToken = ret.token;

      this.logger.log('LS 토큰 갱신 완료');
    } catch (error) {
      this.logger.error('LS 토큰 갱신 실패:', error);

      throw error;
    }
  }

  private async _initKoreanIndex() {
    const kospiIndex = await this.stockKoreanIndexHistoryRepository.findOne({
      where: { type: StockKoreanIndexTypeEnum.KOSPI },
      order: { createdAt: 'DESC' },
    });
    const kosdaqIndex = await this.stockKoreanIndexHistoryRepository.findOne({
      where: { type: StockKoreanIndexTypeEnum.KOSDAQ },
      order: { createdAt: 'DESC' },
    });

    this.kospiIndex = kospiIndex;
    this.kosdaqIndex = kosdaqIndex;
  }
}
