import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuardConfig, configModuleConfig, typeormModuleConfig } from './config';
import { AuthModule, BoardModule, HomeModule, StockModule, UserModule } from './module';

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
    HomeModule,
    StockModule,
    BoardModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: AuthGuardConfig }, AppService],
  exports: [],
})
export class AppModule {}
