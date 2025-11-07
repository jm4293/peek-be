# PEEK Backend

주식 정보 제공 서비스 백엔드 - NestJS 기반 Monorepo 프로젝트

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [주요 기능](#주요-기능)
- [API 문서](#api-문서)
- [환경 변수](#환경-변수)
- [배포](#배포)
- [커밋 컨벤션](#커밋-컨벤션)

## 🎯 프로젝트 개요

PEEK는 국내외 주식 시장의 실시간 정보를 제공하는 서비스입니다. 사용자 서비스와 관리자 서비스로 구성되어 있으며, Monorepo 구조를 통해 효율적으로 코드를 관리합니다.

### 주요 서비스

- **peek**: 일반 사용자를 위한 메인 서비스 (포트: 42973)
- **peek-admin**: 관리자를 위한 백오피스 서비스 (포트: 62740)

## 🛠 기술 스택

### Core

- **Runtime**: Node.js
- **Framework**: NestJS
- **Language**: TypeScript
- **Package Manager**: pnpm (Monorepo)

### Database

- **RDBMS**: MySQL
- **ORM**: TypeORM

### External APIs

- **증권사 API**
  - 한국투자증권 (KIS)
  - LS증권
  - 키움증권 (Kiwoom)
- **환율 정보**: 한국수출입은행 Open API
- **소셜 로그인**: Kakao, Naver, Google

### Infrastructure

- **Cloud**: AWS (EC2, S3, RDS)
- **Push Notification**: Firebase Cloud Messaging
- **Real-time**: WebSocket (Socket.io)
- **Cache**: Cache Manager

## 📁 프로젝트 구조

```
peek-be/
├── apps/                           # 애플리케이션 코드
│   ├── peek/                      # 메인 서비스
│   │   └── src/
│   │       ├── config/            # 설정 파일
│   │       ├── handler/           # 유틸리티 핸들러
│   │       └── module/            # 기능 모듈
│   │           ├── auth/          # 인증 (JWT, OAuth)
│   │           ├── user/          # 사용자 관리
│   │           ├── board/         # 게시판
│   │           ├── stock/         # 주식 정보
│   │           ├── currency/      # 환율 정보
│   │           ├── inquiry/       # 문의
│   │           ├── notice/        # 공지사항
│   │           ├── schedule/      # 스케줄러
│   │           │   ├── kis/       # 한국투자증권
│   │           │   ├── ls/        # LS증권
│   │           │   ├── kiwoom/    # 키움증권
│   │           │   └── currency/  # 환율 업데이트
│   │           └── websocket/     # 실시간 통신
│   │               ├── kis/
│   │               ├── ls/
│   │               └── kiwoom/
│   └── peek-admin/                # 관리자 서비스
│       └── src/
│           └── module/
│               ├── auth/          # 관리자 인증
│               ├── user/          # 회원 관리
│               ├── board/         # 게시판 관리
│               └── stock/         # 종목 관리
└── libs/                          # 공유 라이브러리
    ├── constant/                  # 상수 및 Enum
    │   └── src/enum/
    │       ├── user/              # 사용자 관련
    │       ├── stock/             # 주식 관련
    │       ├── currency/          # 환율 관련
    │       ├── notice/            # 공지사항 관련
    │       └── res/               # 응답 관련
    └── database/                  # 데이터베이스
        ├── entities/              # Entity 정의
        │   ├── user/
        │   ├── board/
        │   ├── stock/
        │   ├── currency/
        │   ├── inquiry/
        │   └── notice/
        └── repositories/          # Repository 패턴
            ├── user/
            ├── board/
            ├── stock/
            ├── currency/
            ├── inquiry/
            └── notice/
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- pnpm 8 이상
- MySQL 8.0 이상

### 설치

1. **pnpm 글로벌 설치**

```bash
npm install -g pnpm
```

2. **의존성 설치**

```bash
pnpm install
```

3. **환경 변수 설정**

루트 디렉토리에 `.env` 파일 생성 ([환경 변수](#환경-변수) 참고)

### 실행

#### 개발 모드

```bash
# 메인 서비스
pnpm run start:dev peek

# 관리자 서비스
pnpm run start:dev peek-admin
```

#### 프로덕션 빌드

```bash
# 빌드
pnpm run build

# 실행
pnpm run start:prod peek
pnpm run start:prod peek-admin
```

## ✨ 주요 기능

### 사용자 서비스 (peek)

- **인증 및 회원관리**
  - 이메일 회원가입 (이메일 인증)
  - 소셜 로그인 (Kakao, Naver, Google)
  - JWT 기반 인증
  - 회원 정보 수정 및 탈퇴

- **주식 정보**
  - 국내 주식 (KOSPI, KOSDAQ) 실시간 시세
  - 미국 주식 실시간 시세
  - 거래량 상위 종목 (Top 10)
  - 관심 종목 관리
  - 캔들 차트 데이터

- **환율 정보**
  - 실시간 환율 정보
  - 환율 히스토리

- **커뮤니티**
  - 게시판 (작성, 수정, 삭제, 조회)
  - 댓글 및 대댓글
  - 좋아요
  - 게시글 이미지 업로드 (AWS S3)

- **고객 지원**
  - 1:1 문의 (이미지 첨부 가능)
  - 공지사항 조회

- **푸시 알림**
  - Firebase Cloud Messaging 연동

### 관리자 서비스 (peek-admin)

- **회원 관리**
  - 회원 목록 조회
  - 회원 상세 정보 조회

- **게시판 관리**
  - 게시글 목록 조회
  - 게시글 상세 조회

- **종목 관리**
  - 종목 코드 업로드 (XLSX)
  - 종목 목록 조회
  - 종목 삭제

### 실시간 기능 (WebSocket)

- 한국 주식 지수 실시간 업데이트
- 미국 주식 지수 실시간 업데이트
- 거래량 상위 종목 실시간 업데이트

### 스케줄러

- **증권사 토큰 관리**
  - 매일 오전 8시 토큰 자동 갱신 (KIS, LS, Kiwoom)

- **환율 정보 업데이트**
  - 평일 오전 11시 자동 업데이트

- **주식 정보 업데이트**
  - 장 시간 중 주기적 업데이트

## 📚 API 문서

각 서비스는 Swagger를 통해 API 문서를 제공합니다.

- **메인 서비스**: `http://localhost:42973/api-docs`
- **관리자 서비스**: `http://localhost:62740/api-docs`

## 🔐 환경 변수

`.env` 파일에 다음 환경 변수를 설정해야 합니다:

```env
# 환경 설정
NODE_ENV=development

# 서버 포트
SERVER_PORT=42973
SERVER_PORT_ADMIN=62740

# JWT
JWT_SECRET_KEY=your_jwt_secret_key

# 데이터베이스
DB_HOST=localhost
DB_PORT=5997
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name

# 이메일 (Gmail)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_KEY=your_gmail_app_key

# AWS
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# 소셜 로그인 - Kakao
KAKAO_APP_KEY=your_kakao_app_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=your_kakao_redirect_uri

# 소셜 로그인 - Naver
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URL=your_naver_redirect_url

# 증권사 API - 한국투자증권
KIS_APP_KEY=your_kis_app_key
KIS_APP_SECRET=your_kis_app_secret

# 증권사 API - LS증권
LS_APP_KEY=your_ls_app_key
LS_APP_SECRET=your_ls_app_secret

# 증권사 API - 키움증권
KIWOOM_APP_KEY=your_kiwoom_app_key
KIWOOM_APP_SECRET=your_kiwoom_app_secret

# 환율 API
OPEN_API_KOREA_EXIM=your_exim_api_key

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

## 🏗 배포

### AWS 아키텍처

```
[Client] → [ALB] → [EC2] → [RDS MySQL]
                    ↓
                  [S3]
```

- **EC2**: 애플리케이션 서버
- **RDS**: MySQL 데이터베이스
- **S3**: 이미지 스토리지
- **ALB**: 로드 밸런서

### 프로덕션 배포 체크리스트

- [ ] 환경 변수 설정 (`NODE_ENV=production`)
- [ ] 데이터베이스 마이그레이션
- [ ] SSL 인증서 설정
- [ ] CORS 설정 확인
- [ ] 로그 수집 설정
- [ ] 모니터링 설정

## 📝 커밋 컨벤션

```
<타입>: <제목>

<본문 (선택사항)>
```

### 타입

- `Feat`: 새로운 기능 추가
- `Fix`: 버그 수정
- `Docs`: 문서 수정
- `Style`: 코드 스타일 변경 (포매팅, 세미콜론 등)
- `Design`: UI 디자인 변경 (CSS 등)
- `Test`: 테스트 코드 추가/수정
- `Refactor`: 코드 리팩토링
- `Build`: 빌드 파일 수정
- `CI`: CI 설정 파일 수정
- `CD`: CD 설정 파일 수정
- `Perf`: 성능 개선
- `Chore`: 기타 수정 (빌드, 패키지 등)
- `Rename`: 파일/폴더명 수정
- `Remove`: 파일 삭제

### 예시

```
Feat: 사용자 회원가입 기능 추가

- 이메일 인증 기능 구현
- 비밀번호 암호화 적용
```

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 👥 개발자

- Backend Developer: jm4293

---

**Note**: Monorepo 구조로 변경한 이유와 자세한 마이그레이션 과정은 [HISTORY.md](HISTORY.md)를 참고하세요.
