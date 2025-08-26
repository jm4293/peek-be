import cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { validationPipeConfig } from './config/validation-pipe';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('certs/key.pem'),
  //   cert: fs.readFileSync('certs/cert.pem'),
  // };

  const app = await NestFactory.create(
    AppModule,
    // { httpsOptions }
  );

  const configService = app.get(ConfigService);

  // configService.get('NODE_ENV') === 'development' && app.setGlobalPrefix('api');

  // 전역 인터셉터 설정
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // 전역 인터셉터 설정 끝

  app.enableCors({
    origin: ['http://localhost:3000', 'https://stock.peek.run'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 유효성 검사 설정
  app.useGlobalPipes(validationPipeConfig);
  // 유효성 검사 설정 끝

  // cookie-parser 미들웨어 추가
  app.use(cookieParser());
  // cookie-parser 미들웨어 추가 끝

  // Firebase Admin SDK 초기화
  // const serviceAccount = {
  //   projectId: configService.get('FIREBASE_PROJECT_ID'),
  //   clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
  //   privateKey: configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  // };
  //
  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount),
  // });
  // Firebase Admin SDK 초기화 끝

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

  await app.listen(configService.get('SERVER_PORT') as string, () => {
    console.info(`서비스 서버: ${configService.get('SERVER_PORT')}`);
  });
}
bootstrap();
