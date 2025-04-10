import { Request } from 'express';

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { IJwtToken } from '../type/interface';

@Injectable()
export class AuthGuardConfig implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());

    const request = context.switchToHttp().getRequest<Request>();

    const token = this._extractTokenFromHeader(request);

    if (token) {
      try {
        request['user'] = this.jwtService.verify<IJwtToken>(token, {
          secret: this.configService.get('JWT_SECRET_KEY'),
        });
      } catch (e) {
        if (!isPublic) {
          throw new UnauthorizedException('유효하지 않은 토큰입니다.');
        }
      }
    } else if (!isPublic) {
      throw new UnauthorizedException('토큰이 존재하지 않습니다.');
    }

    return true;
  }

  // private _extractTokenFromHeader(request: Request): string | undefined {
  //   const [type, token] = request.headers['authorization']?.split(' ') ?? [];
  //   return type === 'Bearer' ? token : undefined;
  // }

  private _extractTokenFromHeader(request: Request): string | undefined {
    const token = request.cookies['AT'];

    return token ? token : undefined;
  }
}
