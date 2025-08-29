import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { TokenRepository } from '@database/repositories/token';

interface IIndex {
  bstp_cls_code: string; // ResponseBodybstp_cls_code    #업종 구분 코드
  bsop_hour: string; // 영업 시간
  prpr_nmix: string; // 현재가 지수
  prdy_vrss_sign: string; // 전일 대비 부호
  bstp_nmix_prdy_vrss: string; // 업종 지수 전일 대비
  acml_vol: string; // 누적 거래량
  acml_tr_pbmn: string; // 누적 거래 대금
  pcas_vol: string; // 건별 거래량
  pcas_tr_pbmn: string; // 건별 거래 대금
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
  qtqt_ascn_issu_cnt: string; // 기세 상승 종목수
  qtqt_down_issu_cnt: string; // 기세 하락 종목수
  tick_vrss: string; // TICK대비
}

const indexKeys = [
  'bstp_cls_code',
  'bsop_hour',
  'prpr_nmix',
  'prdy_vrss_sign',
  'bstp_nmix_prdy_vrss',
  'acml_vol',
  'acml_tr_pbmn',
  'pcas_vol',
  'pcas_tr_pbmn',
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
  'qtqt_ascn_issu_cnt',
  'qtqt_down_issu_cnt',
  'tick_vrss',
];

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://stock.peek.run'],
  },
  namespace: '/kis/korean/index',
})
export class KisKoreanIndexGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KisKoreanIndexGateway.name);
  private kisWebSocket: WebSocket | null = null;
  private kisWebSocketToken: string | null = null;
  private kospiIndex: IIndex = {
    bstp_cls_code: '0001',
    bsop_hour: '153230',
    prpr_nmix: '3186.01',
    prdy_vrss_sign: '5',
    bstp_nmix_prdy_vrss: '-10.31',
    acml_vol: '242210',
    acml_tr_pbmn: '8831078',
    pcas_vol: '0',
    pcas_tr_pbmn: '0',
    prdy_ctrt: '-0.32',
    oprc_nmix: '3208.80',
    nmix_hgpr: '3212.69',
    nmix_lwpr: '3184.48',
    oprc_vrss_nmix_prpr: '12.48',
    oprc_vrss_nmix_sign: '2',
    hgpr_vrss_nmix_prpr: '16.37',
    hgpr_vrss_nmix_sign: '2',
    lwpr_vrss_nmix_prpr: '-11.84',
    lwpr_vrss_nmix_sign: '5',
    prdy_clpr_vrss_oprc_rate: '0.39',
    prdy_clpr_vrss_hgpr_rate: '0.51',
    prdy_clpr_vrss_lwpr_rate: '-0.37',
    uplm_issu_cnt: '0',
    ascn_issu_cnt: '301',
    stnr_issu_cnt: '51',
    down_issu_cnt: '581',
    lslm_issu_cnt: '0',
    qtqt_ascn_issu_cnt: '0',
    qtqt_down_issu_cnt: '0',
    tick_vrss: '16',
  };

  private kosdaqIndex: IIndex = {
    bstp_cls_code: '1001',
    bsop_hour: '153230',
    prpr_nmix: '796.91',
    prdy_vrss_sign: '5',
    bstp_nmix_prdy_vrss: '-1.52',
    acml_vol: '844281',
    acml_tr_pbmn: '5006644',
    pcas_vol: '85',
    pcas_tr_pbmn: '149',
    prdy_ctrt: '-0.19',
    oprc_nmix: '801.96',
    nmix_hgpr: '805.94',
    nmix_lwpr: '795.56',
    oprc_vrss_nmix_prpr: '3.53',
    oprc_vrss_nmix_sign: '2',
    hgpr_vrss_nmix_prpr: '7.51',
    hgpr_vrss_nmix_sign: '2',
    lwpr_vrss_nmix_prpr: '-2.87',
    lwpr_vrss_nmix_sign: '5',
    prdy_clpr_vrss_oprc_rate: '0.44',
    prdy_clpr_vrss_hgpr_rate: '0.94',
    prdy_clpr_vrss_lwpr_rate: '-0.36',
    uplm_issu_cnt: '3',
    ascn_issu_cnt: '584',
    stnr_issu_cnt: '107',
    down_issu_cnt: '1041',
    lslm_issu_cnt: '1',
    qtqt_ascn_issu_cnt: '0',
    qtqt_down_issu_cnt: '0',
    tick_vrss: '6',
  };

  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(private readonly tokenRepository: TokenRepository) {}

  async onModuleInit() {
    await this._setKisToken();
    await this._connectToKis();

    this.logger.log(`KIS WebSocket token initialized: ${this.kisWebSocketToken}`);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`클라이언트 연결: ${client.id}`);

    client.emit(`${this.kospiIndex.bstp_cls_code}`, this.kospiIndex);
    client.emit(`${this.kosdaqIndex.bstp_cls_code}`, this.kosdaqIndex);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 연결 해제: ${client.id}`);
  }

  private async _connectToKis() {
    try {
      this.kisWebSocket = new WebSocket('ws://ops.koreainvestment.com:21000');
    } catch (error) {
      this.logger.error('KIS WebSocket 연결 실패:', error);
      return;
    }

    this.kisWebSocket.onopen = async () => {
      if (!this.kisWebSocketToken) {
        await this._setKisToken();
      }

      this.reconnectAttempts = 0;

      try {
        const messageKOSPI = {
          header: {
            approval_key: this.kisWebSocketToken,
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
            approval_key: this.kisWebSocketToken,
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
    try {
      const ret = await this.tokenRepository.getSocketToken();
      this.kisWebSocketToken = ret.token;
      this.logger.log('KIS 토큰 갱신 완료');
    } catch (error) {
      this.logger.error('KIS 토큰 갱신 실패:', error);
      throw error;
    }
  }
}
