import * as Joi from 'joi';

import { ConfigModuleOptions } from '@nestjs/config';

export const configModuleConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: ['.env'],
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

    SERVER_PORT: Joi.number().default(42973),
    SERVER_PORT_ADMIN: Joi.number().default(62740),

    JWT_SECRET_KEY: Joi.string().required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5997),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),

    GMAIL_USER: Joi.string().required(),
    GMAIL_APP_KEY: Joi.string().required(),

    AWS_REGION: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),

    KAKAO_APP_KEY: Joi.string().required(),
    KAKAO_CLIENT_SECRET: Joi.string().required(),
    KAKAO_REDIRECT_URI: Joi.string().required(),

    NAVER_CLIENT_ID: Joi.string().required(),
    NAVER_CLIENT_SECRET: Joi.string().required(),
    NAVER_REDIRECT_URL: Joi.string().required(),

    KIS_APP_KEY: Joi.string().required(),
    KIS_APP_SECRET: Joi.string().required(),

    LS_APP_KEY: Joi.string().required(),
    LS_APP_SECRET: Joi.string().required(),

    KIWOOM_APP_KEY: Joi.string().required(),
    KIWOOM_APP_SECRET: Joi.string().required(),

    OPEN_API_KOREA_EXIM: Joi.string().required(),
  }),
};
