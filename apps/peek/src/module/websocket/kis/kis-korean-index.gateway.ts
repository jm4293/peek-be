import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { StockKoreanIndexTypeEnum } from '@constant/enum/stock';
import { TokenProviderEnum } from '@constant/enum/token';

import { StockKoreanIndexHistoryRepository } from '@database/repositories/stock';
import { TokenRepository } from '@database/repositories/token';

interface ILsIndex {
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

// interface IKisIndex {
//   bstp_cls_code: string; // ResponseBodybstp_cls_code    #업종 구분 코드
//   bsop_hour: string; // 영업 시간
//   prpr_nmix: string; // 현재가 지수
//   prdy_vrss_sign: string; // 전일 대비 부호
//   bstp_nmix_prdy_vrss: string; // 업종 지수 전일 대비
//   acml_vol: string; // 누적 거래량
//   acml_tr_pbmn: string; // 누적 거래 대금
//   pcas_vol: string; // 건별 거래량
//   pcas_tr_pbmn: string; // 건별 거래 대금
//   prdy_ctrt: string; // 전일 대비율
//   oprc_nmix: string; // 시가 지수
//   nmix_hgpr: string; // 지수 최고가
//   nmix_lwpr: string; // 지수 최저가
//   oprc_vrss_nmix_prpr: string; // 시가 대비 지수 현재가
//   oprc_vrss_nmix_sign: string; // 시가 대비 지수 부호
//   hgpr_vrss_nmix_prpr: string; // 최고가 대비 지수 현재가
//   hgpr_vrss_nmix_sign: string; // 최고가 대비 지수 부호
//   lwpr_vrss_nmix_prpr: string; // 최저가 대비 지수 현재가
//   lwpr_vrss_nmix_sign: string; // 최저가 대비 지수 부호
//   prdy_clpr_vrss_oprc_rate: string; // 전일 종가 대비 시가2 비율
//   prdy_clpr_vrss_hgpr_rate: string; // 전일 종가 대비 최고가 비율
//   prdy_clpr_vrss_lwpr_rate: string; // 전일 종가 대비 최저가 비율
//   uplm_issu_cnt: string; // 상한 종목 수
//   ascn_issu_cnt: string; // 상승 종목 수
//   stnr_issu_cnt: string; // 보합 종목 수
//   down_issu_cnt: string; // 하락 종목 수
//   lslm_issu_cnt: string; // 하한 종목 수
//   qtqt_ascn_issu_cnt: string; // 기세 상승 종목수
//   qtqt_down_issu_cnt: string; // 기세 하락 종목수
//   tick_vrss: string; // TICK대비
// }

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

const KOSPI_TR_KEY = '0001';
const KOSDAQ_TR_KEY = '1001';

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'https://stock.peek.run'] },
  namespace: '/kis/korean/index',
})
export class KisKoreanIndexGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KisKoreanIndexGateway.name);
  private kisWebSocket: WebSocket | null = null;
  private kisWebSocketToken: string | null = null;
  private kospiIndex: ILsIndex | null = null;
  private kosdaqIndex: ILsIndex | null = null;

  constructor(
    private readonly configService: ConfigService,

    private readonly tokenRepository: TokenRepository,
    private readonly stockKoreanIndexHistoryRepository: StockKoreanIndexHistoryRepository,
  ) {}

  async onModuleInit() {
    await this._initKoreanIndex();

    if (this.configService.get('NODE_ENV') === 'production') {
      await this._setKisToken();
      await this._connectToKis();
    }
  }

  async handleConnection(client: Socket) {
    this.logger.log(`KIS 클라이언트 연결: ${client.id}`);

    client.emit(KOSPI_TR_KEY, this.kospiIndex);
    client.emit(KOSDAQ_TR_KEY, this.kosdaqIndex);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`KIS 클라이언트 연결 해제: ${client.id}`);
  }

  private async _connectToKis() {
    try {
      this.kisWebSocket = new WebSocket('ws://ops.koreainvestment.com:21000');
    } catch (error) {
      this.logger.error('웹소켓 KIS 한국 지수 연결 실패:', error);
      return;
    }

    this.kisWebSocket.onopen = async () => {
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

        this.logger.log('웹소켓 KIS 한국 지수 연결 성공');
      } catch (error) {
        this.logger.error('웹소켓 KIS 한국 지수 onopen 핸들러에서 오류 발생');
        this.kisWebSocket.close();
      }
    };

    this.kisWebSocket.onmessage = (event) => {
      try {
        const ret = event.data.toString();

        const data = ret.split('|')[3]?.split('^');

        if (data) {
          const indexObj = Object.fromEntries(indexKeys.map((key, i) => [key, data[i]]));

          if (+indexObj.bsop_hour > 222222) {
            return;
          }

          if (indexObj.bstp_cls_code === KOSPI_TR_KEY) {
            const convertedIndexObj = {
              type: StockKoreanIndexTypeEnum.KOSPI,
              time: indexObj.bsop_hour,
              jisu: indexObj.prpr_nmix,
              sign: indexObj.prdy_vrss_sign,
              change: indexObj.bstp_nmix_prdy_vrss,
              drate: indexObj.prdy_ctrt,
              cvolume: indexObj.pcas_vol,
              volume: indexObj.acml_vol,
              value: indexObj.acml_tr_pbmn,
              upjo: indexObj.uplm_issu_cnt,
              highjo: indexObj.ascn_issu_cnt,
              unchgjo: indexObj.stnr_issu_cnt,
              lowjo: indexObj.down_issu_cnt,
              downjo: indexObj.lslm_issu_cnt,
              upjrate: null,
              openjisu: indexObj.oprc_nmix,
              opentime: null,
              highjisu: indexObj.nmix_hgpr,
              hightime: null,
              lowjisu: indexObj.nmix_lwpr,
              lowtime: null,
              frgsvolume: null,
              orgsvolume: null,
              frgsvalue: null,
              orgsvalue: null,
              upcode: indexObj.bstp_cls_code,
            };

            this.kospiIndex = convertedIndexObj;
            this.server.emit(KOSPI_TR_KEY, convertedIndexObj);

            this.stockKoreanIndexHistoryRepository.save(convertedIndexObj);
          }

          if (indexObj.bstp_cls_code === KOSDAQ_TR_KEY) {
            const convertedIndexObj = {
              type: StockKoreanIndexTypeEnum.KOSDAQ,
              time: indexObj.bsop_hour,
              jisu: indexObj.prpr_nmix,
              sign: indexObj.prdy_vrss_sign,
              change: indexObj.bstp_nmix_prdy_vrss,
              drate: indexObj.prdy_ctrt,
              cvolume: indexObj.pcas_vol,
              volume: indexObj.acml_vol,
              value: indexObj.acml_tr_pbmn,
              upjo: indexObj.uplm_issu_cnt,
              highjo: indexObj.ascn_issu_cnt,
              unchgjo: indexObj.stnr_issu_cnt,
              lowjo: indexObj.down_issu_cnt,
              downjo: indexObj.lslm_issu_cnt,
              upjrate: null,
              openjisu: indexObj.oprc_nmix,
              opentime: null,
              highjisu: indexObj.nmix_hgpr,
              hightime: null,
              lowjisu: indexObj.nmix_lwpr,
              lowtime: null,
              frgsvolume: null,
              orgsvolume: null,
              frgsvalue: null,
              orgsvalue: null,
              upcode: indexObj.bstp_cls_code,
            };

            this.kosdaqIndex = convertedIndexObj;
            this.server.emit(KOSDAQ_TR_KEY, convertedIndexObj);

            this.stockKoreanIndexHistoryRepository.save(convertedIndexObj);
          }
        }
      } catch (error) {
        this.logger.error('웹소켓 KIS 한국 지수 onmessage 핸들러에서 오류 발생');
      }
    };

    this.kisWebSocket.onerror = (error) => {
      this.logger.error('웹소켓 KIS 한국 지수 WebSocket 오류');
    };

    this.kisWebSocket.onclose = (event) => {
      this.logger.log(`웹소켓 KIS 한국 지수 WebSocket 연결 종료`);
    };
  }

  private async _setKisToken() {
    try {
      const ret = await this.tokenRepository.getSocketToken(TokenProviderEnum.KIS);

      this.kisWebSocketToken = ret.token;

      this.logger.log('웹소켓 KIS 한국 지수 토큰 불러오기 성공');
    } catch (error) {
      this.logger.error('웹소켓 KIS 한국 지수 토큰 불러오기 실패');

      throw error;
    }
  }

  private async _initKoreanIndex() {
    const kospiIndex = await this.stockKoreanIndexHistoryRepository.findOne({
      where: { type: StockKoreanIndexTypeEnum.KOSPI },
      order: { id: 'DESC' },
    });
    const kosdaqIndex = await this.stockKoreanIndexHistoryRepository.findOne({
      where: { type: StockKoreanIndexTypeEnum.KOSDAQ },
      order: { id: 'DESC' },
    });

    this.kospiIndex = kospiIndex;
    this.kosdaqIndex = kosdaqIndex;
  }
}
