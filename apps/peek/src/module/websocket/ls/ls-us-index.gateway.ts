import { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { SecuritiesTokenRepository } from '@libs/database/repositories/stock';

import { TokenProvider } from '@libs/shared/const/token';

const TR_CD = 'MK2';

const DOWJONES_TR_KEY = 'DJI@DJI         ';
const SP500_TR_KEY = 'SPI@SPX         ';
const NASDAQ_TR_KEY = 'NAS@IXIC        ';
const INDEXNASDAQ_TR_KEY = 'USI@SOXX        ';

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'https://stock.peek.run'] },
  namespace: '/ls/us/index',
})
export class LsUsIndexGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  socketServer: Server;

  private readonly logger = new Logger(LsUsIndexGateway.name);

  private lsSocket: WebSocket | null = null;
  private lsSocketToken: string | null = null;

  private djiIndex = null;
  private spiIndex = null;
  private nasdaqIndex = null;
  private phlxSemiconductorIndex = null;

  constructor(private readonly securitiesTokenRepository: SecuritiesTokenRepository) {}

  async handleConnection(client: Socket) {
    this.logger.log(`웹소켓 LS US 지수 클라이언트 연결: ${client.id}`);

    client.emit('connected', true);
    if (this.djiIndex) {
      client.emit(DOWJONES_TR_KEY, this.djiIndex, JSON.parse(JSON.stringify(this.djiIndex.createdAt)));
    }
    if (this.spiIndex) {
      client.emit(SP500_TR_KEY, this.spiIndex, JSON.parse(JSON.stringify(this.spiIndex.createdAt)));
    }
    if (this.nasdaqIndex) {
      client.emit(NASDAQ_TR_KEY, this.nasdaqIndex, JSON.parse(JSON.stringify(this.nasdaqIndex.createdAt)));
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`웹소켓 LS US 지수 클라이언트 연결 해제: ${client.id}`);
  }

  async connectToLsUsIndex() {
    this.lsSocket = new WebSocket('wss://openapi.ls-sec.co.kr:9443/websocket');

    this.lsSocket.onopen = async () => {
      const messageDJI = {
        header: {
          token: `${this.lsSocketToken}`,
          tr_type: '3',
        },
        body: {
          tr_cd: TR_CD,
          tr_key: DOWJONES_TR_KEY,
        },
      };

      const messageSPI = {
        header: {
          token: `${this.lsSocketToken}`,
          tr_type: '3',
        },
        body: {
          tr_cd: TR_CD,
          tr_key: SP500_TR_KEY,
        },
      };

      const messageNAS = {
        header: {
          token: `${this.lsSocketToken}`,
          tr_type: '3',
        },
        body: {
          tr_cd: TR_CD,
          tr_key: NASDAQ_TR_KEY,
        },
      };

      const messageINDEXNASDAQ = {
        header: {
          token: `${this.lsSocketToken}`,
          tr_type: '3',
        },
        body: {
          tr_cd: TR_CD,
          tr_key: INDEXNASDAQ_TR_KEY,
        },
      };

      this.lsSocket.send(JSON.stringify(messageDJI));
      this.lsSocket.send(JSON.stringify(messageSPI));
      this.lsSocket.send(JSON.stringify(messageNAS));
      this.lsSocket.send(JSON.stringify(messageINDEXNASDAQ));

      this.logger.log('웹소켓 LS US 지수 연결 성공');
    };

    this.lsSocket.onmessage = (event) => {
      const ret = event.data.toString();

      // console.log('ret', ret);

      const { header, body } = JSON.parse(ret);

      // console.log('LS US INDEX WEBSOCKET MESSAGE:', ret);

      if (body) {
        const { tr_cd, tr_key } = header;

        if (tr_key === DOWJONES_TR_KEY) {
          this.djiIndex = { ...body, createdAt: new Date() };
          this.socketServer.emit(DOWJONES_TR_KEY, this.djiIndex, this.djiIndex.createdAt.toISOString());
        }

        if (tr_key === SP500_TR_KEY) {
          this.spiIndex = { ...body, createdAt: new Date() };
          this.socketServer.emit(SP500_TR_KEY, this.spiIndex, this.spiIndex.createdAt.toISOString());
        }

        if (tr_key === NASDAQ_TR_KEY) {
          this.nasdaqIndex = { ...body, createdAt: new Date() };
          this.socketServer.emit(NASDAQ_TR_KEY, this.nasdaqIndex, this.nasdaqIndex.createdAt.toISOString());
        }

        if (tr_key === INDEXNASDAQ_TR_KEY) {
          this.phlxSemiconductorIndex = { ...body, createdAt: new Date() };
          this.socketServer.emit(
            INDEXNASDAQ_TR_KEY,
            this.phlxSemiconductorIndex,
            this.phlxSemiconductorIndex.createdAt.toISOString(),
          );
        }

        console.log('tr_cd', tr_cd, 'tr_key', tr_key, 'body', body);
      }
    };

    this.lsSocket.onerror = (error) => {
      this.logger.error('웹소켓 LS 오류:', error);
    };

    this.lsSocket.onclose = (event) => {
      this.logger.log(`웹소켓 LS 연결 종료: ${event.code} - ${event.reason}`);
    };
  }

  async setLsUsIndexToken() {
    try {
      const ret = await this.securitiesTokenRepository.getOAuthToken(TokenProvider.LS);
      this.lsSocketToken = ret.token;
      this.logger.log('웹소켓 LS US 지수 토큰 갱신 완료');
    } catch (error) {
      this.logger.error('웹소켓 LS US 지수 토큰 갱신 실패:', error);
      throw error;
    }
  }

  closeLsUsIndexConnection() {
    if (this.lsSocket) {
      this.lsSocket.close();
      this.lsSocket = null;
      this.logger.log('웹소켓 LS US 지수 연결 종료 완료');
    }
  }

  async initLsUsIndexData() {
    // const kospiIndex = await this.stockKoreanIndexHistoryRepository.findOne({
    //   where: { type: StockKoreanIndexType.KOSPI },
    //   order: { createdAt: 'DESC' },
    // });
    // const kosdaqIndex = await this.stockKoreanIndexHistoryRepository.findOne({
    //   where: { type: StockKoreanIndexType.KOSDAQ },
    //   order: { createdAt: 'DESC' },
    // });
    // this.kospiIndex = kospiIndex;
    // this.kosdaqIndex = kosdaqIndex;
  }
}
