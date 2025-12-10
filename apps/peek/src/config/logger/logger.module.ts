import { WinstonModule } from 'nest-winston';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { createWinstonConfig } from './winston.config';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => createWinstonConfig(configService),
    }),
  ],
})
export class LoggerModule {}
