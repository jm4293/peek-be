import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AWS_S3_BUCKET_NAME } from '@peek/shared/constants/aws';
import { IMAGE_TYPE } from '@peek/shared/constants/image-type';

import { AWSService } from '../aws';

@Injectable()
export class ImageService {
  constructor(private readonly awsService: AWSService) {}

  async uploadImage(params: { file: Express.Multer.File; type: keyof typeof IMAGE_TYPE }) {
    const { file, type } = params;

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

      await this.awsService.getS3Client().send(command);
    } catch (error) {
      console.error(error);

      throw new BadRequestException('이미지 업로드에 실패했습니다.');
    }

    return key;
  }

  async getProcessedImage(params: {
    fileName: string;
    type: keyof typeof IMAGE_TYPE;
    width?: number;
    height?: number;
    quality?: number;
  }) {
    const { fileName, type, width, height, quality = 80 } = params;

    try {
      const command = new GetObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: `${type}/${fileName}`,
      });

      const response = await this.awsService.getS3Client().send(command);
      const imageBuffer = await this.streamToBuffer(response.Body as any);

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

  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
