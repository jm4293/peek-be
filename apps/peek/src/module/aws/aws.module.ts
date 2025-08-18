import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AWSService } from './aws.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [AWSService],
  exports: [AWSService],
})
export class AWSModule {}
