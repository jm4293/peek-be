import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

export interface Response<T> {
  success: boolean;
  timestamp: string;
  path: string;
  statusCode: number;
  message?: string;
  data?: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const statusCode = context.switchToHttp().getResponse().statusCode || 200;

    return next.handle().pipe(
      map((data) => {
        // 이미 포맷된 응답인지 확인 (ExceptionFilter에서 처리된 경우)
        if (data && typeof data === 'object' && 'success' in data && 'timestamp' in data) {
          return data;
        }

        // 정상 응답 포맷
        return {
          success: true,
          timestamp: new Date().toISOString(),
          path: request.url,
          statusCode: statusCode,
          data: data,
        };
      }),
    );
  }
}
