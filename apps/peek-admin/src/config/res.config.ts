import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResEnum } from '@libs/constant/enum';

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
