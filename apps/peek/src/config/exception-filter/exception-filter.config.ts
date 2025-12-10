import { Request, Response } from 'express';

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isDevelopment = process.env.NODE_ENV === 'development';

    let status: number;
    let message: string | string[] | object;
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message = typeof errorResponse === 'object' ? errorResponse['message'] || errorResponse : errorResponse;
    } else {
      // 예상치 못한 에러 (500)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      // 개발 환경에서만 스택 트레이스 포함
      if (isDevelopment && exception instanceof Error) {
        stack = exception.stack;
        message = exception.message || message;
      }
    }

    // 에러 로깅 (500 에러는 더 상세하게)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`);
    }

    const errorResponse: any = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
      message: message,
    };

    // 개발 환경에서만 스택 트레이스 포함
    if (isDevelopment && stack) {
      errorResponse.stack = stack;
    }

    response.status(status).json(errorResponse);
  }
}
