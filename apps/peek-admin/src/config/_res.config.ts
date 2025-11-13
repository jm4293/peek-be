import { Response } from 'express';
import { ResEnum } from 'libs/shared/src/const/res';

import { HttpStatus } from '@nestjs/common';

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
