import { Request } from 'express';

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { IS_PUBLIC_KEY } from '@peek/decorator/public';
import { ACCESS_TOKEN_NAME } from '@peek/shared/constants/cookie';
import { IJwtToken } from '@peek/type/interface';

@Injectable()
export class AuthGuardConfig implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const token = this._extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request['userAccount'] = this.jwtService.verify<IJwtToken>(token, {
        secret: this.configService.get('JWT_SECRET_KEY'),
      });

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private _extractTokenFromHeader(request: Request): string | undefined {
    // const [type, token] = request.headers['authorization']?.split(' ') ?? [];

    // return type === 'Bearer' ? token : undefined;

    const cookies = request.headers.cookie?.split('; ') ?? [];
    const accessTokenCookie = cookies.find((cookie) => cookie.startsWith(`${ACCESS_TOKEN_NAME}=`));

    return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
  }
}
