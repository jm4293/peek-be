import cookieParser from 'cookie-parser';

import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { validationPipeConfig } from '@peek/config/validation-pipe';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // configService.get('NODE_ENV') === 'development' && app.setGlobalPrefix('admin');
  app.setGlobalPrefix('admin');

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: ['http://localhost:29980'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 전역 Pipe 설정
  app.useGlobalPipes(validationPipeConfig);
  // 전역 Pipe 설정 끝

  // cookie-parser 미들웨어 추가
  app.use(cookieParser());
  // cookie-parser 미들웨어 추가 끝

  // Swagger 설정
  const config = new DocumentBuilder().setTitle('PEEK API Documentation').setVersion('1.0').build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'],
      locale: 'ko',
    },
  });
  // Swagger 설정 끝

  await app.listen(configService.get('SERVER_PORT_ADMIN') as string, () => {
    console.info(`어드민 서버: ${configService.get('SERVER_PORT_ADMIN')}`);
  });
}
bootstrap();
