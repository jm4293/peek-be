import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { KisTokenRepository } from '@database/repositories/kis';

interface IIndex {
  bstp_cls_code: string; // ResponseBodybstp_cls_code    #업종 구분 코드
  bsop_hour: string; // 영업 시간
  prpr_nmix: string; // 현재가 지수
  prdy_vrss_sign: string; // 전일 대비 부호
  bstp_nmix_prdy_vrss: string; // 업종 지수 전일 대비
  acml_vol: string; // 누적 거래량
  acml_tr_pbmn: string; // 누적 거래 대금
  //   pcas_vol: string ; // 건별 거래량
  //   pcas_tr_pbmn: string ; // 건별 거래 대금
  prdy_ctrt: string; // 전일 대비율
  oprc_nmix: string; // 시가 지수
  nmix_hgpr: string; // 지수 최고가
  nmix_lwpr: string; // 지수 최저가
  oprc_vrss_nmix_prpr: string; // 시가 대비 지수 현재가
  oprc_vrss_nmix_sign: string; // 시가 대비 지수 부호
  hgpr_vrss_nmix_prpr: string; // 최고가 대비 지수 현재가
  hgpr_vrss_nmix_sign: string; // 최고가 대비 지수 부호
  lwpr_vrss_nmix_prpr: string; // 최저가 대비 지수 현재가
  lwpr_vrss_nmix_sign: string; // 최저가 대비 지수 부호
  prdy_clpr_vrss_oprc_rate: string; // 전일 종가 대비 시가2 비율
  prdy_clpr_vrss_hgpr_rate: string; // 전일 종가 대비 최고가 비율
  prdy_clpr_vrss_lwpr_rate: string; // 전일 종가 대비 최저가 비율
  uplm_issu_cnt: string; // 상한 종목 수
  ascn_issu_cnt: string; // 상승 종목 수
  stnr_issu_cnt: string; // 보합 종목 수
  down_issu_cnt: string; // 하락 종목 수
  lslm_issu_cnt: string; // 하한 종목 수
  //   qtqt_ascn_issu_cnt: string ; // 기세 상승 종목수
  //   qtqt_down_issu_cnt: string ; // 기세 하락 종목수
  //   tick_vrss: string ; // TICK대비
}

const indexKeys = [
  'bstp_cls_code',
  'bsop_hour',
  'prpr_nmix',
  'prdy_vrss_sign',
  'bstp_nmix_prdy_vrss',
  'acml_vol',
  'acml_tr_pbmn',
  'prdy_ctrt',
  'oprc_nmix',
  'nmix_hgpr',
  'nmix_lwpr',
  'oprc_vrss_nmix_prpr',
  'oprc_vrss_nmix_sign',
  'hgpr_vrss_nmix_prpr',
  'hgpr_vrss_nmix_sign',
  'lwpr_vrss_nmix_prpr',
  'lwpr_vrss_nmix_sign',
  'prdy_clpr_vrss_oprc_rate',
  'prdy_clpr_vrss_hgpr_rate',
  'prdy_clpr_vrss_lwpr_rate',
  'uplm_issu_cnt',
  'ascn_issu_cnt',
  'stnr_issu_cnt',
  'down_issu_cnt',
  'lslm_issu_cnt',
];

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://stock.peek.run'],
  },
  namespace: '/kis/korean/index',
})
export class KisIndexGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KisIndexGateway.name);
  private kisWebSocket: WebSocket | null = null;
  private kisWebSocketToken: string | null = null;

  private kospiIndex: IIndex = {
    bstp_cls_code: '0001',
    bsop_hour: null,
    prpr_nmix: null,
    prdy_vrss_sign: null,
    bstp_nmix_prdy_vrss: null,
    acml_vol: null,
    acml_tr_pbmn: null,
    prdy_ctrt: null,
    oprc_nmix: null,
    nmix_hgpr: null,
    nmix_lwpr: null,
    oprc_vrss_nmix_prpr: null,
    oprc_vrss_nmix_sign: null,
    hgpr_vrss_nmix_prpr: null,
    hgpr_vrss_nmix_sign: null,
    lwpr_vrss_nmix_prpr: null,
    lwpr_vrss_nmix_sign: null,
    prdy_clpr_vrss_oprc_rate: null,
    prdy_clpr_vrss_hgpr_rate: null,
    prdy_clpr_vrss_lwpr_rate: null,
    uplm_issu_cnt: null,
    ascn_issu_cnt: null,
    stnr_issu_cnt: null,
    down_issu_cnt: null,
    lslm_issu_cnt: null,
  };
  private kosdaqIndex: IIndex = {
    bstp_cls_code: '1001',
    bsop_hour: null,
    prpr_nmix: null,
    prdy_vrss_sign: null,
    bstp_nmix_prdy_vrss: null,
    acml_vol: null,
    acml_tr_pbmn: null,
    prdy_ctrt: null,
    oprc_nmix: null,
    nmix_hgpr: null,
    nmix_lwpr: null,
    oprc_vrss_nmix_prpr: null,
    oprc_vrss_nmix_sign: null,
    hgpr_vrss_nmix_prpr: null,
    hgpr_vrss_nmix_sign: null,
    lwpr_vrss_nmix_prpr: null,
    lwpr_vrss_nmix_sign: null,
    prdy_clpr_vrss_oprc_rate: null,
    prdy_clpr_vrss_hgpr_rate: null,
    prdy_clpr_vrss_lwpr_rate: null,
    uplm_issu_cnt: null,
    ascn_issu_cnt: null,
    stnr_issu_cnt: null,
    down_issu_cnt: null,
    lslm_issu_cnt: null,
  };

  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(private readonly kisTokenRepository: KisTokenRepository) {}

  async onModuleInit() {
    await this._setKisToken();
    await this._connectToKis();

    this.logger.log(`KIS WebSocket token initialized: ${this.kisWebSocketToken}`);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`클라이언트 연결: ${client.id}`);
    console.log(`클라이언트 연결: ${client.id}`);

    client.emit(`${this.kospiIndex.bstp_cls_code}`, this.kospiIndex);
    client.emit(`${this.kosdaqIndex.bstp_cls_code}`, this.kosdaqIndex);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 연결 해제: ${client.id}`);
    console.log(`클라이언트 연결 해제: ${client.id}`);
  }

  private async _connectToKis() {
    try {
      this.kisWebSocket = new WebSocket('ws://ops.koreainvestment.com:21000');
    } catch (error) {
      this.logger.error('KIS WebSocket 연결 실패:', error);
      return;
    }

    this.kisWebSocket.onopen = async () => {
      this.reconnectAttempts = 0; // 연결 성공 시 초기화
      try {
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
              tr_key: '0001',
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
              tr_key: '1001',
            },
          },
        };

        this.kisWebSocket.send(JSON.stringify(messageKOSPI));
        this.kisWebSocket.send(JSON.stringify(messageKOSDAQ));
      } catch (error) {
        this.logger.error('KIS onopen 핸들러에서 오류 발생:', error);
        this.kisWebSocket.close();
      }
    };

    this.kisWebSocket.onmessage = (event) => {
      try {
        const ret = event.data.toString();

        const data = ret.split('|')[3]?.split('^');

        if (data) {
          const indexObj = Object.fromEntries(indexKeys.map((key, i) => [key, data[i]]));

          this.server.emit(`${indexObj.bstp_cls_code}`, indexObj);

          if (indexObj.bstp_cls_code === '0001') {
            this.kospiIndex = indexObj as unknown as IIndex;
          } else if (indexObj.bstp_cls_code === '1001') {
            this.kosdaqIndex = indexObj as unknown as IIndex;
          }
        }
      } catch (error) {
        this.logger.error('KIS onmessage 핸들러에서 오류 발생:', error);
      }
    };

    this.kisWebSocket.onerror = (error) => {
      this.logger.error('KIS WebSocket 오류:', error);
    };

    this.kisWebSocket.onclose = (event) => {
      this.logger.log(`KIS WebSocket 연결 종료: ${event.code} - ${event.reason}`);

      if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts++;

        setTimeout(() => {
          this._connectToKis();
        }, 3000);
      } else {
        this.logger.error('KIS WebSocket 최대 재연결 시도 횟수 초과');
      }
    };
  }

  private async _setKisToken() {
    const ret = await this.kisTokenRepository.getSocketToken();
    this.kisWebSocketToken = ret.token;
  }
}
