import { Body, Controller, Post } from '@nestjs/common';

import { Public } from '@peek/decorator/public';

import { SendVerificationDto, VerifyCodeDto } from './dto';
import { EmailVerificationService } from './email-verification.service';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @Public()
  @Post('send-code')
  async sendVerificationCode(@Body() sendVerificationDto: SendVerificationDto) {
    this.emailVerificationService.sendVerificationCode(sendVerificationDto.email);

    return { message: '인증 코드가 전송되었습니다.' };
  }

  @Public()
  @Post('verify-code')
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return await this.emailVerificationService.verifyCode(verifyCodeDto.email, verifyCodeDto.code);
  }
}
