import { Response } from 'express';
import pLimit from 'p-limit';

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { Public } from '@peek/decorator/public';
import { IMAGE_TYPE } from '@peek/shared/constants/image-type';

import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('이미지를 업로드 해주세요.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('이미지 파일 크기는 5MB를 초과할 수 없습니다.');
    }

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      throw new BadRequestException('지원하는 이미지 형식은 JPEG와 PNG입니다.');
    }

    const ret = await this.imageService.uploadImage({ file, type: IMAGE_TYPE.THUMBNAIL });

    return {
      fileName: ret,
    };
  }

  @Public()
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('이미지를 업로드 해주세요.');
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(`이미지 파일 크기는 5MB를 초과할 수 없습니다. (파일명: ${file.originalname})`);
      }

      if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
        throw new BadRequestException(`지원하는 이미지 형식은 JPEG와 PNG입니다. (파일명: ${file.originalname})`);
      }
    }

    const limit = pLimit(2);

    const uploadTasks = files.map((file) =>
      limit(() => this.imageService.uploadImage({ file, type: IMAGE_TYPE.THUMBNAIL })),
    );

    const fileNames = await Promise.allSettled(uploadTasks);

    const successUploads = fileNames.filter((result) => result.status === 'fulfilled').map((result) => result.value);

    const failUploads = fileNames
      .filter((result) => result.status === 'rejected')
      .map((result, index) => files[index].originalname);

    return { successUploads, failUploads };
  }

  @Public()
  @Get(':fileName')
  async getImage(
    @Param('fileName') fileName: string,
    @Query('type') type: keyof typeof IMAGE_TYPE,
    @Query('w') width?: string,
    @Query('h') height?: string,
    @Query('q') quality?: string,
    @Res() res?: Response,
  ) {
    if (!type) {
      throw new BadRequestException('이미지 타입이 필요합니다.');
    }

    const processedImage = await this.imageService.getProcessedImage({
      fileName,
      type,
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality: quality ? parseInt(quality) : 80,
    });

    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000',
    });

    res.send(processedImage);
  }
}
