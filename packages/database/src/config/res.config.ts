import { ResEnum } from '../constant/enum';
import { HttpStatus, BadRequestException } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { Response } from 'express';

export class ResConfig<T = unknown> {
  static Success<T>(params: { res: Response; statusCode: 'OK' | 'CREATED' | 'ACCEPTED'; message?: string; data?: T }) {
    const { res, statusCode, message, data } = params;

    return res.status(HttpStatus[statusCode]).send({ result: ResEnum.SUCCESS, message, data });
  }

  static Redirect(params: { res: Response; statusCode: 'MOVED_PERMANENTLY' | 'FOUND'; redirectUrl?: string }) {
    const { res, statusCode, redirectUrl } = params;

    return res.status(HttpStatus[statusCode]).send({ redirectUrl });
  }

  static Fail_400(params: { message?: string }) {
    const { message } = params;

    return new BadRequestException({ message });
  }

  static Fail_401(params: { status: HttpStatus; message?: string }) {
    const { message } = params;

    return new UnauthorizedException();
  }

  static Fail_403(params: { message?: string }) {
    const { message } = params;

    return new ForbiddenException();
  }

  static Fail_404(params: { status: HttpStatus; message?: string }) {
    const { message } = params;

    return new NotFoundException();
  }

  static Fail_500(params: { status: HttpStatus; message?: string }) {
    const { message } = params;

    return new InternalServerErrorException({ message });
  }
}
