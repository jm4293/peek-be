import cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';

import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AuthGuardConfig } from './config/auth-guard';
import { HttpExceptionFilter } from './config/exception-filter';
import { ResponseInterceptor } from './config/response-interceptor';
import { validationPipeConfig } from './config/validation-pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // configService.get('NODE_ENV') === 'development' && app.setGlobalPrefix('api');

  // ============================================
  // 1. Middleware 설정 (가장 먼저 실행)
  // ============================================
  app.enableCors({
    origin: ['http://localhost:3000', 'http://8134293.iptime.org:42930', 'https://stock.peek.run'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(cookieParser());
  // Middleware 설정 끝

  // ============================================
  // 2. Guards 설정 (인증/권한 체크)
  // ============================================
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  app.useGlobalGuards(new AuthGuardConfig(jwtService, configService, reflector));
  // Guards 설정 끝

  // ============================================
  // 3. Interceptors 설정 (before - 로깅 등)
  // ============================================
  // 필요시 여기에 before 인터셉터 추가
  // Interceptors (before) 설정 끝

  // ============================================
  // 4. Pipes 설정 (검증/변환)
  // ============================================
  app.useGlobalPipes(validationPipeConfig);
  // Pipes 설정 끝

  // ============================================
  // 5. Interceptors 설정 (after - Serialization, Response Formatting)
  // ============================================
  app.useGlobalInterceptors(
    // new CustomClassSerializerInterceptor(app.get(Reflector)),
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );
  // Interceptors (after) 설정 끝

  // ============================================
  // 6. Exception Filters 설정 (예외 처리)
  // ============================================
  app.useGlobalFilters(new HttpExceptionFilter());
  // Exception Filters 설정 끝

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
