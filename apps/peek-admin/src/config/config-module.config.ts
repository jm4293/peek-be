import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export const configModuleConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: ['.env'],
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

    SERVER_PORT: Joi.number().default(42973),

    JWT_SECRET_KEY: Joi.string().required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5997),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
  }),
};
