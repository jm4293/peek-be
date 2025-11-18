import { Response } from 'express';

import { HttpStatus } from '@nestjs/common';

import { ResEnum } from '@libs/shared/const/res';

export class ResConfig<T = unknown> {
  static Success<T>(params: { res: Response; statusCode: 'OK' | 'CREATED' | 'ACCEPTED'; message?: string; data?: T }) {
    const { res, statusCode, message, data } = params;

    return res.status(HttpStatus[statusCode]).send({ result: ResEnum.SUCCESS, message, data });
  }

  static Redirect(params: { res: Response; statusCode: 'MOVED_PERMANENTLY' | 'FOUND'; redirectUrl?: string }) {
    const { res, statusCode, redirectUrl } = params;

    return res.status(HttpStatus[statusCode]).send({ redirectUrl });
  }
}
