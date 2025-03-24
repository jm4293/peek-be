import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const jwtModuleConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    global: true,
    secret: configService.get('JWT_SECRET_KEY'),
    signOptions: { expiresIn: '1h' },
  }),
  inject: [ConfigService],
};
