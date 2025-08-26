import { Cache } from 'cache-manager';
import * as nodemailer from 'nodemailer';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailVerificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('GMAIL_USER'),
        pass: this.configService.get('GMAIL_APP_KEY'),
      },
    });
  }

  async sendVerificationCode(email: string) {
    const code = this._generateVerificationCode();
    const cacheKey = `email_verification:${email}`;

    try {
      await this.cacheManager.set(cacheKey, code, 300000); // 300000ms = 5분

      await this.transporter.sendMail({
        from: '"PEEK" <peek@no-reply.com>',
        to: email,
        subject: 'PEEK 이메일 인증 코드',
        html: `
          <h2>이메일 인증</h2>
          <p>인증 코드: <strong>${code}</strong></p>
          <p>이 코드는 5분간 유효합니다.</p>
        `,
      });
    } catch (error) {
      throw new BadRequestException('인증 코드 전송에 실패했습니다.');
    }
  }

  async verifyCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    const cacheKey = `email_verification:${email}`;

    try {
      const cachedCode = await this.cacheManager.get<string>(cacheKey);

      if (!cachedCode) {
        // return {
        //   success: false,
        //   message: '인증 코드가 만료되었거나 존재하지 않습니다.',
        // };

        throw new BadRequestException('인증 코드가 만료되었거나 존재하지 않습니다.');
      }

      if (cachedCode !== code) {
        // return {
        //   success: false,
        //   message: '잘못된 인증 코드입니다.',
        // };

        throw new BadRequestException('잘못된 인증 코드입니다.');
      }

      await this.cacheManager.del(cacheKey);

      return {
        success: true,
        message: '이메일 인증이 완료되었습니다.',
      };
    } catch (error) {
      throw error;
    }
  }

  private _generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
