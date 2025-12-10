import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';

/**
 * HTTP 요청/응답 로깅 인터셉터
 * - 요청 메서드, URL, IP, User-Agent 기록
 * - 응답 시간 측정
 * - 상태 코드 기록
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // 요청 로깅
    this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const { statusCode } = response;
          const contentLength = response.get('content-length');

          // 응답 로깅
          this.logger.log(
            `${method} ${url} ${statusCode} ${responseTime}ms${contentLength ? ` - ${contentLength}` : ''}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error?.status || 500;

          // 상태 코드에 따라 로그 레벨 구분
          // 500 이상: 서버 에러 (error 레벨)
          // 400-499: 클라이언트 에러 (warn 레벨)
          if (statusCode >= 500) {
            this.logger.error(
              `${method} ${url} ${statusCode} ${responseTime}ms - ${error?.message || 'Unknown error'}`,
              error?.stack,
            );
          } else {
            // 400-499 클라이언트 에러는 warn 레벨로 로깅 (error.log에 저장되지 않음)
            this.logger.warn(`${method} ${url} ${statusCode} ${responseTime}ms - ${error?.message || 'Unknown error'}`);
          }
        },
      }),
    );
  }
}
