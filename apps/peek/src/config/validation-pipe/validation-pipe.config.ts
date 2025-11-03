import { BadRequestException, ValidationPipe } from '@nestjs/common';

const isProduction = process.env.NODE_ENV === 'production';

export const validationPipeConfig = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  transform: true,
  exceptionFactory: (errors) => {
    return new BadRequestException({
      message: '유효성 검사 오류',
      errors: errors.map((e) => e.constraints),
    });
  },
  enableDebugMessages: !isProduction,
  disableErrorMessages: isProduction,
});
