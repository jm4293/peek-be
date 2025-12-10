import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { cacheModuleConfig } from './config/cache';
import { configModuleConfig } from './config/config';
import { LoggerModule } from './config/logger';
import { typeormModuleConfig } from './config/typeorm';
import { AuthModule } from './module/auth';
import { AWSModule } from './module/aws';
import { BoardModule } from './module/board';
import { CurrencyModule } from './module/currency';
import { EmailVerificationModule } from './module/email-verification';
import { HomeModule } from './module/home';
import { ImageModule } from './module/image';
import { InquiryModule } from './module/inquiry';
import { NoticeModule } from './module/notice';
import { CurrencyScheduleModule, KisScheduleModule, KiwoomScheduleModule, LsScheduleModule } from './module/schedule';
import { StockModule } from './module/stock';
import { UserModule } from './module/user';
import { KisWebSocketModule, KiwoomWebSocketModule, LsWebSocketModule } from './module/websocket';

/**
 * imports: 다른 모듈을 가져오기
 * controllers: 이 모듈에서 제공하는 컨트롤러
 * providers: 서비스, 팩토리 등 주입 가능한 프로바이더
 * exports: 다른 모듈에서 사용할 수 있도록 내보내는 프로바이더
 */

@Module({
  imports: [
    ConfigModule.forRoot(configModuleConfig),
    TypeOrmModule.forRootAsync(typeormModuleConfig),
    ScheduleModule.forRoot(),
    CacheModule.register(cacheModuleConfig),
    LoggerModule,

    AuthModule,
    AWSModule,
    BoardModule,
    CurrencyModule,
    EmailVerificationModule,
    HomeModule,
    ImageModule,
    InquiryModule,
    NoticeModule,
    StockModule,
    UserModule,

    CurrencyScheduleModule,
    // KisScheduleModule,
    LsScheduleModule,
    // KiwoomScheduleModule,

    // KisWebSocketModule,
    LsWebSocketModule,
    // KiwoomWebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
