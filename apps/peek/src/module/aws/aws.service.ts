import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AWS_S3_BUCKET_NAME } from '@peek/constant/aws';
import { IMAGE_TYPE } from '@peek/constant/image-type';

@Injectable()
export class AWSService {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }

  async uploadImage(params: { file: Express.Multer.File; type: keyof typeof IMAGE_TYPE }) {
    const { file, type } = params;

    if (!file) {
      throw new BadRequestException('이미지를 업로드 해주세요.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('이미지 파일 크기는 5MB를 초과할 수 없습니다.');
    }

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      throw new BadRequestException('지원하는 이미지 형식은 JPEG와 PNG입니다.');
    }

    const now = Date.now();

    const fileName = `${now}-${file.originalname}`;
    const key = `${type}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalname: file.originalname,
          size: file.size.toString(),
          mimetype: file.mimetype,
        },
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error(error);

      throw new BadRequestException('이미지 업로드에 실패했습니다.');
    }

    return fileName;
  }

  async getProcessedImage(params: {
    fileName: string;
    type: keyof typeof IMAGE_TYPE;
    width?: number;
    height?: number;
    quality?: number;
  }) {
    const { fileName, type, width, height, quality = 80 } = params;

    if (!type) {
      throw new BadRequestException('이미지 타입이 필요합니다.');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: `${type}/${fileName}`,
      });

      const response = await this.s3Client.send(command);
      const imageBuffer = await this._streamToBuffer(response.Body as any);

      let sharpInstance = sharp(imageBuffer);

      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'cover',
          withoutEnlargement: true,
        });
      }

      return await sharpInstance.webp({ quality }).toBuffer();
    } catch (error) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }
  }

  private async _streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
