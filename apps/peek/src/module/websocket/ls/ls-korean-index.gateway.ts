import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { SecuritiesTokenRepository, StockKoreanIndexHistoryRepository } from '@libs/database/repositories/stock';

import { StockKoreanIndexType } from '@libs/shared/const/stock';
import { TokenProvider } from '@libs/shared/const/token';

const TR_CD = 'IJ_';

const KOSPI_TR_KEY = '001';
const KOSDAQ_TR_KEY = '301';

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'https://stock.peek.run'] },
  namespace: '/ls/korean/index',
})
export class LsKoreanIndexGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  socketServer: Server;

  private readonly logger = new Logger(LsKoreanIndexGateway.name);

  private lsSocket: WebSocket | null = null;
  private lsSocketToken: string | null = null;

  private kospiIndex = null;
  private kosdaqIndex = null;

  constructor(
    private readonly securitiesTokenRepository: SecuritiesTokenRepository,
    private readonly stockKoreanIndexHistoryRepository: StockKoreanIndexHistoryRepository,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`웹소켓 LS 한국 지수 클라이언트 연결: ${client.id}`);

    client.emit('connected', true);
    if (this.kospiIndex) {
      client.emit(KOSPI_TR_KEY, this.kospiIndex, JSON.parse(JSON.stringify(this.kospiIndex.createdAt)));
    }

    if (this.kosdaqIndex) {
      client.emit(KOSDAQ_TR_KEY, this.kosdaqIndex, JSON.parse(JSON.stringify(this.kosdaqIndex.createdAt)));
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`웹소켓 LS 한국 지수 클라이언트 연결 해제: ${client.id}`);
  }

  async connectToLsKoreanIndex() {
    this.lsSocket = new WebSocket('wss://openapi.ls-sec.co.kr:9443/websocket');

    this.lsSocket.onopen = async () => {
      const messageKOSPI = {
        header: {
          token: `${this.lsSocketToken}`,
          tr_type: '3',
        },
        body: {
          tr_cd: TR_CD,
          tr_key: KOSPI_TR_KEY,
        },
      };

      const messageKOSDAQ = {
        header: {
          token: `${this.lsSocketToken}`,
          tr_type: '3',
        },
        body: {
          tr_cd: TR_CD,
          tr_key: KOSDAQ_TR_KEY,
        },
      };

      this.lsSocket.send(JSON.stringify(messageKOSPI));
      this.lsSocket.send(JSON.stringify(messageKOSDAQ));

      this.logger.log('웹소켓 LS 한국 지수 연결 성공');
    };

    this.lsSocket.onmessage = (event) => {
      const ret = event.data.toString();

      const { header, body } = JSON.parse(ret);

      console.log('LS KOREAN INDEX WEBSOCKET MESSAGE:', ret);

      if (body) {
        const { tr_cd, tr_key } = header;

        if (tr_key === KOSPI_TR_KEY) {
          this.kospiIndex = { ...body, createdAt: new Date() };

          this.socketServer.emit(KOSPI_TR_KEY, this.kospiIndex, this.kospiIndex.createdAt.toISOString());

          this.stockKoreanIndexHistoryRepository.save({
            ...body,
            type: StockKoreanIndexType.KOSPI,
          });
        }

        if (tr_key === KOSDAQ_TR_KEY) {
          this.kosdaqIndex = { ...body, createdAt: new Date() };

          this.socketServer.emit(KOSDAQ_TR_KEY, this.kosdaqIndex, this.kosdaqIndex.createdAt.toISOString());

          this.stockKoreanIndexHistoryRepository.save({
            ...body,
            type: StockKoreanIndexType.KOSDAQ,
          });
        }
      }
    };

    this.lsSocket.onerror = (error) => {
      this.logger.error('웹소켓 LS 한국 지수 오류:', error);
    };

    this.lsSocket.onclose = (event) => {
      this.logger.log(`웹소켓 LS 한국 지수 연결 종료: ${event.code} - ${event.reason}`);
    };
  }

  async setLsKoreanIndexToken() {
    try {
      const ret = await this.securitiesTokenRepository.getOAuthToken(TokenProvider.LS);

      this.lsSocketToken = ret.token;

      this.logger.log('웹소켓 LS 한국 지수 토큰 갱신 완료');
    } catch (error) {
      this.logger.error('웹소켓 LS 한국 지수 토큰 갱신 실패:', error);

      throw error;
    }
  }

  closeLsKoreanIndexConnection() {
    if (this.lsSocket) {
      this.lsSocket.close();
      this.lsSocket = null;

      this.logger.log('웹소켓 LS 한국 지수 연결 종료 완료');
    }
  }

  async initLsKoreanIndexData() {
    const kospiIndex = await this.stockKoreanIndexHistoryRepository.findOne({
      where: { type: StockKoreanIndexType.KOSPI },
      order: { createdAt: 'DESC' },
    });
    const kosdaqIndex = await this.stockKoreanIndexHistoryRepository.findOne({
      where: { type: StockKoreanIndexType.KOSDAQ },
      order: { createdAt: 'DESC' },
    });

    this.kospiIndex = kospiIndex;
    this.kosdaqIndex = kosdaqIndex;
  }
}
