import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { ConfigService } from '@nestjs/config';

/**
 * Winston 로거 설정
 * - 콘솔 출력
 * - 파일 저장 (일별 로테이션)
 * - 에러 로그 별도 저장
 */
export const createWinstonConfig = (configService: ConfigService) => {
  const nodeEnv = configService.get('NODE_ENV') || 'development';
  const isDevelopment = nodeEnv === 'development';

  // 로그 포맷 정의
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  );

  // 콘솔 포맷 (개발 환경에서만 색상 적용)
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, context, trace }) => {
      return `${timestamp} [${context || 'Application'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
    }),
  );

  // 일별 로테이션 파일 설정
  const dailyRotateFileTransport = new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true, // 오래된 로그 압축
    maxSize: '50m', // 파일 크기 제한 (50MB - 보편적 설정)
    maxFiles: '14d', // 14일간 보관 (보편적 설정)
    format: logFormat,
    level: 'info',
  });

  // 경고 로그 전용 파일 (400번대 클라이언트 에러 등)
  // 커스텀 필터: warn 레벨이지만 error는 제외
  const warnFileTransport = new DailyRotateFile({
    filename: 'logs/warn-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '50m', // 파일 크기 제한 (50MB - 보편적 설정)
    maxFiles: '30d', // 30일간 보관 (보편적 설정)
    format: logFormat,
    level: 'warn', // warn 레벨부터 시작
  });

  // warn transport에 필터 추가: error 레벨은 제외
  warnFileTransport.format = winston.format.combine(
    winston.format((info) => {
      // error 레벨은 제외 (error.log에만 저장)
      return info.level === 'error' ? false : info;
    })(),
    logFormat,
  );

  // 에러 로그 전용 포맷 (stack 필드 제외)
  const errorLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: false }), // stack 제거
    winston.format.splat(),
    winston.format((info) => {
      // stack 필드 제거
      delete info.stack;
      return info;
    })(),
    winston.format.json(),
  );

  // 에러 로그 전용 파일 (500번대 서버 에러)
  const errorFileTransport = new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '50m', // 파일 크기 제한 (50MB - 보편적 설정)
    maxFiles: '90d', // 에러 로그는 90일간 보관 (보편적 설정)
    format: errorLogFormat, // stack 없는 포맷 사용
    level: 'error', // error 레벨만 저장
  });

  return {
    transports: [
      // 콘솔 출력
      new winston.transports.Console({
        level: isDevelopment ? 'debug' : 'info',
        format: isDevelopment ? consoleFormat : logFormat,
      }),
      // 일반 로그 파일
      dailyRotateFileTransport,
      // 경고 로그 파일 (400번대 클라이언트 에러 등)
      warnFileTransport,
      // 에러 로그 파일 (500번대 서버 에러)
      errorFileTransport,
    ],
    // 전역 예외 처리
    exceptionHandlers: [
      new DailyRotateFile({
        filename: 'logs/exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '50m', // 파일 크기 제한 (50MB - 보편적 설정)
        maxFiles: '90d', // 90일간 보관 (보편적 설정)
        format: logFormat,
      }),
    ],
    // Promise 거부 처리
    rejectionHandlers: [
      new DailyRotateFile({
        filename: 'logs/rejections-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '50m', // 파일 크기 제한 (50MB - 보편적 설정)
        maxFiles: '90d', // 90일간 보관 (보편적 설정)
        format: logFormat,
      }),
    ],
  };
};
