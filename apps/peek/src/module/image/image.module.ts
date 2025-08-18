import { Module } from '@nestjs/common';

import { AWSService } from '../aws';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

@Module({
  imports: [],
  controllers: [ImageController],
  providers: [ImageService, AWSService],
  exports: [],
})
export class ImageModule {}
