import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { TokenProviderEnum } from '@constant/enum/token';

import { TokenRepository } from '@database/repositories/token';

interface IIndex {}

const indexKeys = [];

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://stock.peek.run'],
  },
  namespace: '/ls/domestic/index',
})
export class LsDomesticIndexGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LsDomesticIndexGateway.name);
  private lsWebSocket: WebSocket | null = null;
  private lsWebSocketToken: string | null = null;
  private kospiIndex: IIndex = {};
  private kosdaqIndex: IIndex = {};

  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(private readonly tokenRepository: TokenRepository) {}

  async onModuleInit() {
    await this._setLsToken();
    await this._connectToLs();

    this.logger.log(`Ls WebSocket token initialized: ${this.lsWebSocketToken}`);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`LS 클라이언트 연결: ${client.id}`);

    // client.emit(`${this.kospiIndex.bstp_cls_code}`, this.kospiIndex);
    // client.emit(`${this.kosdaqIndex.bstp_cls_code}`, this.kosdaqIndex);
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
        const messageNASDAQ = {
          header: {
            token: this.lsWebSocketToken,
            tr_type: '3',
          },
          body: {
            tr_cd: 'AS1',
            tr_key: 'AAPL',
          },
        };

        this.lsWebSocket.send(JSON.stringify(messageNASDAQ));
      } catch (error) {
        this.logger.error('LS onopen 핸들러에서 오류 발생:', error);
        this.lsWebSocket.close();
      }
    };

    this.lsWebSocket.onmessage = (event) => {
      try {
        const ret = event.data.toString();

        console.log('Ls Index Data:', ret);

        // const data = ret.split('|')[3]?.split('^');

        // if (data) {
        //   const indexObj = Object.fromEntries(indexKeys.map((key, i) => [key, data[i]]));

        //   this.server.emit(`${indexObj.bstp_cls_code}`, indexObj);

        //   if (indexObj.bstp_cls_code === '0001') {
        //     this.kospiIndex = indexObj as unknown as IIndex;
        //   } else if (indexObj.bstp_cls_code === '1001') {
        //     this.kosdaqIndex = indexObj as unknown as IIndex;
        //   }
        // }
      } catch (error) {
        this.logger.error('LS onmessage 핸들러에서 오류 발생:', error);
      }
    };

    this.lsWebSocket.onerror = (error) => {
      this.logger.error('LS WebSocket 오류:', error);
    };

    this.lsWebSocket.onclose = (event) => {
      // console.log('event', event);
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

      this.logger.log('Ls 토큰 갱신 완료');
    } catch (error) {
      this.logger.error('Ls 토큰 갱신 실패:', error);

      throw error;
    }
  }
}
