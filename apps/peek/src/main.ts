import cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';

import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { CustomClassSerializerInterceptor } from './config/serializer';
import { validationPipeConfig } from './config/validation-pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // configService.get('NODE_ENV') === 'development' && app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:3000', 'http://8134293.iptime.org:42930', 'https://stock.peek.run'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 전역 Pipe 설정
  app.useGlobalPipes(validationPipeConfig);
  // 전역 Pipe 설정 끝

  // cookie-parser 미들웨어 추가
  app.use(cookieParser());
  // cookie-parser 미들웨어 추가 끝

  //  전역 Serialization 설정
  app.useGlobalInterceptors(new CustomClassSerializerInterceptor(app.get(Reflector)));
  //  전역 Serialization 설정 끝

  // Firebase Admin SDK 초기화
  const serviceAccount = {
    projectId: configService.get('FIREBASE_PROJECT_ID'),
    clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
    privateKey: configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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
