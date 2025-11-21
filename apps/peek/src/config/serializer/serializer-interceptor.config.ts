import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { Reflector } from '@nestjs/core';

export class CustomClassSerializerInterceptor extends ClassSerializerInterceptor {
  constructor(reflector: Reflector) {
    super(reflector, {
      excludeExtraneousValues: false,
    });
  }

  transformToPlain(data: any, options?: any): any {
    // Response 객체나 Node.js 내부 객체는 직렬화하지 않음
    if (data && typeof data === 'object') {
      // Response 객체 체크 (Express Response)
      if ('status' in data && 'send' in data && 'cookie' in data && 'set' in data) {
        return data;
      }

      // Request 객체 체크 (Express Request)
      if ('method' in data && 'url' in data && 'headers' in data && 'cookies' in data) {
        return data;
      }

      // Socket 객체 체크 (Socket.IO)
      if ('on' in data && 'emit' in data && 'disconnect' in data && 'id' in data) {
        return data;
      }

      // WebSocket 객체 체크 (ws)
      if ('readyState' in data && 'send' in data && 'close' in data && 'on' in data) {
        return data;
      }

      // Server 객체 체크
      if ('listen' in data && 'close' in data && 'on' in data) {
        return data;
      }
    }

    try {
      return super.transformToPlain(data, options);
    } catch (error: any) {
      // 직렬화 실패 시 원본 데이터 반환 (Node.js 내부 객체 관련 에러)
      if (
        error?.message &&
        (error.message.includes('removeListener') || error.message.includes('ERR_INTERNAL_ASSERTION'))
      ) {
        return data;
      }
      throw error;
    }
  }
}
