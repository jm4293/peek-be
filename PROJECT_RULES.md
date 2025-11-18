# PEEK Backend - 프로젝트 개발 규칙

> 이 문서는 PEEK 백엔드 프로젝트의 코딩 컨벤션, 아키텍처 패턴, 그리고 개발 가이드라인을 정의합니다.

## 📑 목차

- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [코딩 컨벤션](#코딩-컨벤션)
- [디렉토리 구조](#디렉토리-구조)
- [개발 워크플로우](#개발-워크플로우)
- [API 개발 가이드](#api-개발-가이드)
- [데이터베이스 규칙](#데이터베이스-규칙)
- [보안 가이드라인](#보안-가이드라인)
- [테스트 전략](#테스트-전략)
- [배포 및 운영](#배포-및-운영)

---

## 프로젝트 개요

### 프로젝트 구조

PEEK는 NestJS 기반의 **Monorepo** 프로젝트로, 다음과 같이 구성됩니다:

- **apps/peek**: 일반 사용자를 위한 메인 서비스 (포트: 42973)
- **apps/peek-admin**: 관리자를 위한 백오피스 서비스 (포트: 62740)
- **libs/**: 공유 라이브러리 (constant, database)

### 패키지 관리

- **pnpm workspace**를 사용한 Monorepo 관리
- 공통 의존성은 루트 `package.json`에서 관리
- 각 앱별 독립적인 실행 및 빌드 가능

---

## 기술 스택

### Core

- **Runtime**: Node.js 18+
- **Framework**: NestJS 11+
- **Language**: TypeScript 5+
- **Package Manager**: pnpm 8+

### Database

- **RDBMS**: MySQL 8.0
- **ORM**: TypeORM 0.3+
- **Migration**: TypeORM CLI

### External Services

- **증권사 API**: 한국투자증권(KIS), LS증권, 키움증권
- **소셜 로그인**: Kakao, Naver, Google OAuth 2.0
- **환율 API**: 한국수출입은행 Open API
- **Cloud**: AWS (EC2, S3, RDS)
- **Push Notification**: Firebase Cloud Messaging
- **Email**: Nodemailer (Gmail SMTP)

### Development Tools

- **Linter**: ESLint
- **Formatter**: Prettier
- **API Documentation**: Swagger/OpenAPI
- **Real-time**: Socket.io
- **Cache**: Cache Manager
- **Validation**: class-validator, class-transformer

---

## 아키텍처

### Layered Architecture

```
┌─────────────────────────────────────────┐
│          Controller Layer               │  ← HTTP 요청 처리, 검증
├─────────────────────────────────────────┤
│           Service Layer                 │  ← 비즈니스 로직
├─────────────────────────────────────────┤
│         Repository Layer                │  ← 데이터 접근
├─────────────────────────────────────────┤
│           Entity Layer                  │  ← 데이터 모델
└─────────────────────────────────────────┘
```

### 모듈 구조 원칙

1. **단일 책임 원칙**: 각 모듈은 하나의 도메인만 담당
2. **의존성 주입**: Constructor Injection 사용
3. **느슨한 결합**: 인터페이스를 통한 의존성 관리
4. **높은 응집도**: 관련된 기능은 같은 모듈에 배치

### 공통 라이브러리 (libs/)

```typescript
libs/
├── constant/           // 상수 및 Enum
│   └── src/enum/
│       ├── user/      // 사용자 관련 Enum
│       ├── stock/     // 주식 관련 Enum
│       ├── currency/  // 환율 관련 Enum
│       └── res/       // 응답 코드 Enum
└── database/          // 데이터베이스 관련
    ├── entities/      // TypeORM Entity
    └── repositories/  // Repository 패턴
```

**사용 예시:**

```typescript
import { UserRoleEnum } from '@libs/share/const/user';

import { UserEntity } from '@libs/database/entities/user';
```

---

## 코딩 컨벤션

### TypeScript 규칙

#### 1. 타입 안정성

```typescript
// ❌ 나쁜 예
function getUser(id: any): any {
  return users.find(u => u.id === id);
}

// ✅ 좋은 예
function getUser(id: number): UserEntity | undefined {
  return users.find(u => u.id === id);
}
```

#### 2. Interface vs Type

- **Interface 우선**: 확장 가능성이 있는 경우
- **Type**: Union, Intersection 등 복잡한 타입

```typescript
// ✅ Interface 사용
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

// ✅ Type 사용 (Union)
type UserStatus = 'active' | 'inactive' | 'suspended';
```

#### 3. Enum 사용

```typescript
// ✅ String Enum 권장
export enum UserRoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

// ❌ Numeric Enum 지양
enum UserRole {
  USER, // 0
  ADMIN, // 1
}
```

### 네이밍 컨벤션

#### 파일명

```
kebab-case.{type}.ts

예시:
- user-profile.controller.ts
- user-profile.service.ts
- create-user.req.dto.ts
- user-profile.res.dto.ts
```

#### 클래스명

```typescript
// Controller
export class UserProfileController {}

// Service
export class UserProfileService {}

// DTO
export class CreateUserReqDto {}
export class UserProfileResDto {}

// Entity
export class UserEntity {}

// Repository
export class UserRepository {}
```

#### 변수 및 함수

```typescript
// camelCase
const userName = 'John';
function getUserProfile() {}

// Boolean은 is, has, can 등으로 시작
const isActive = true;
const hasPermission = false;
const canDelete = true;

// Private 멤버는 _ prefix
class UserService {
  private _cache: Map<string, User>;
}
```

#### 상수

```typescript
// UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;
```

### Import 순서

Prettier plugin을 사용하여 자동 정렬:

```typescript
// 1. Node.js built-in
// 3. Internal aliases
import { UserRoleEnum } from '@libs/share/const/user';
import { readFileSync } from 'fs';

// 2. External libraries
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '@libs/database/entities/user';

// 4. Relative imports
import { CreateUserReqDto } from './dto/request/create-user.req.dto';
import { UserService } from './user.service';
```

---

## 디렉토리 구조

### 모듈 구조 템플릿

```
module-name/
├── dto/
│   ├── request/
│   │   ├── create-{entity}.req.dto.ts
│   │   ├── update-{entity}.req.dto.ts
│   │   └── {action}-{entity}.req.dto.ts
│   └── response/
│       ├── {entity}-detail.res.dto.ts
│       ├── {entity}-list.res.dto.ts
│       └── {action}-{entity}.res.dto.ts
├── {module}.controller.ts
├── {module}.service.ts
├── {module}.module.ts
└── index.ts
```

### 파일 역할

#### Controller

```typescript
@Controller('users')
@ApiTags('사용자')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: '사용자 상세 조회' })
  @ApiResponse({ status: 200, type: UserDetailResDto })
  async getUserDetail(@Param('id') id: number) {
    return this.userService.getUserDetail(id);
  }
}
```

**역할**:

- HTTP 요청/응답 처리
- 요청 데이터 검증 (DTO)
- Swagger 문서화
- 인증/권한 Guard 적용

#### Service

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async getUserDetail(id: number): Promise<UserDetailResDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }
    return new UserDetailResDto(user);
  }
}
```

**역할**:

- 비즈니스 로직 구현
- 트랜잭션 관리
- 외부 API 호출
- 에러 처리

#### Repository

```typescript
@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ where: { email } });
  }

  async findActiveUsers(): Promise<UserEntity[]> {
    return this.find({
      where: { status: UserStatusEnum.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }
}
```

**역할**:

- 데이터베이스 쿼리
- 복잡한 조회 로직
- 쿼리 최적화

---

## 개발 워크플로우

### 1. 브랜치 전략

```
main (production)
  ↑
develop (staging)
  ↑
feature/기능명
fix/버그명
refactor/리팩토링명
```

### 2. 커밋 메시지

```
<타입>: <제목>

<본문 (선택)>

<푸터 (선택)>
```

**타입**:

- `Feat`: 새로운 기능 추가
- `Fix`: 버그 수정
- `Docs`: 문서 수정
- `Style`: 코드 포맷팅 (기능 변경 없음)
- `Design`: UI/CSS 변경
- `Refactor`: 코드 리팩토링
- `Test`: 테스트 코드 추가/수정
- `Chore`: 빌드, 패키지 등 기타 변경
- `Perf`: 성능 개선
- `CI`: CI 설정 변경
- `CD`: CD 설정 변경
- `Rename`: 파일/폴더명 수정
- `Remove`: 파일 삭제

**예시**:

```
Feat: 사용자 프로필 수정 API 추가

- PUT /api/users/:id 엔드포인트 구현
- 프로필 이미지 S3 업로드 기능 추가
- 닉네임 중복 검사 로직 구현

Closes #123
```

### 3. 코드 리뷰 체크리스트

- [ ] 코딩 컨벤션 준수
- [ ] 타입 안정성 확보
- [ ] DTO 검증 구현
- [ ] Swagger 문서화
- [ ] 에러 처리
- [ ] 테스트 코드 작성
- [ ] 성능 최적화 (N+1 문제 등)
- [ ] 보안 검증 (인증, 권한)

---

## API 개발 가이드

### 1. RESTful API 설계

#### URL 규칙

```
GET    /api/users              # 목록 조회
GET    /api/users/:id          # 상세 조회
POST   /api/users              # 생성
PUT    /api/users/:id          # 전체 수정
PATCH  /api/users/:id          # 부분 수정
DELETE /api/users/:id          # 삭제
```

#### HTTP 상태 코드

```typescript
200 OK              // 성공
201 Created         // 생성 성공
204 No Content      // 삭제 성공

400 Bad Request     // 잘못된 요청
401 Unauthorized    // 인증 실패
403 Forbidden       // 권한 없음
404 Not Found       // 리소스 없음
409 Conflict        // 충돌 (중복 등)

500 Internal Error  // 서버 에러
```

### 2. DTO (Data Transfer Object)

#### Request DTO

```typescript
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserReqDto {
  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호 (8-20자)',
    example: 'password123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({
    description: '닉네임',
    example: '홍길동',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;
}
```

#### Response DTO

```typescript
import { Exclude, Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class UserDetailResDto {
  @ApiProperty({ description: '사용자 ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: '이메일' })
  @Expose()
  email: string;

  @ApiProperty({ description: '닉네임' })
  @Expose()
  nickname: string;

  @ApiProperty({ description: '생성일시' })
  @Expose()
  createdAt: Date;

  // 비밀번호는 응답에서 제외
  @Exclude()
  password: string;

  constructor(partial: Partial<UserDetailResDto>) {
    Object.assign(this, partial);
  }
}
```

### 3. Swagger 문서화

```typescript
@Controller('users')
@ApiTags('사용자')
@ApiBearerAuth()
export class UserController {
  @Post()
  @ApiOperation({ summary: '사용자 생성' })
  @ApiResponse({
    status: 201,
    description: '생성 성공',
    type: UserDetailResDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 409,
    description: '이메일 중복',
  })
  async createUser(@Body() dto: CreateUserReqDto) {
    return this.userService.createUser(dto);
  }
}
```

### 4. 에러 처리

```typescript
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  async createUser(dto: CreateUserReqDto): Promise<UserEntity> {
    // 이메일 중복 검사
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다');
    }

    try {
      // 사용자 생성 로직
      return await this.userRepository.save(user);
    } catch (error) {
      // 예상치 못한 에러
      throw new BadRequestException('사용자 생성에 실패했습니다');
    }
  }
}
```

### 5. 페이지네이션

```typescript
// Request DTO
export class PaginationReqDto {
  @ApiProperty({ description: '페이지 번호', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '페이지 크기', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Response DTO
export class PaginationResDto<T> {
  @ApiProperty({ description: '데이터 목록' })
  data: T[];

  @ApiProperty({ description: '전체 개수' })
  total: number;

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}

// Service
async getUserList(dto: PaginationReqDto): Promise<PaginationResDto<UserEntity>> {
  const [data, total] = await this.userRepository.findAndCount({
    skip: (dto.page - 1) * dto.limit,
    take: dto.limit,
    order: { createdAt: 'DESC' },
  });

  return {
    data,
    total,
    page: dto.page,
    limit: dto.limit,
    totalPages: Math.ceil(total / dto.limit),
  };
}
```

---

## 데이터베이스 규칙

### 1. Entity 작성

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { KoreanTime } from '@libs/database/decorators';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.USER,
  })
  role: UserRoleEnum;

  @Column({
    type: 'enum',
    enum: UserStatusEnum,
    default: UserStatusEnum.ACTIVE,
  })
  status: UserStatusEnum;

  @KoreanTime()
  @Column({ type: 'datetime' })
  createdAt: Date;

  @KoreanTime()
  @Column({ type: 'datetime' })
  updatedAt: Date;
}
```

### 2. 관계 설정

```typescript
// One-to-Many
@Entity('users')
export class UserEntity {
  @OneToMany(() => BoardEntity, (board) => board.user)
  boards: BoardEntity[];
}

@Entity('boards')
export class BoardEntity {
  @ManyToOne(() => UserEntity, (user) => user.boards)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: number;
}
```

### 3. 쿼리 최적화

```typescript
// ❌ N+1 문제
const users = await this.userRepository.find();
for (const user of users) {
  const boards = await this.boardRepository.find({ where: { userId: user.id } });
}

// ✅ Join으로 해결
const users = await this.userRepository.find({
  relations: ['boards'],
});

// ✅ QueryBuilder로 세밀한 제어
const users = await this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.boards', 'board')
  .where('user.status = :status', { status: UserStatusEnum.ACTIVE })
  .orderBy('user.createdAt', 'DESC')
  .getMany();
```

### 4. 트랜잭션

```typescript
async transferPoints(fromUserId: number, toUserId: number, amount: number) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 포인트 차감
    await queryRunner.manager.decrement(
      UserEntity,
      { id: fromUserId },
      'points',
      amount,
    );

    // 포인트 추가
    await queryRunner.manager.increment(
      UserEntity,
      { id: toUserId },
      'points',
      amount,
    );

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

---

## 보안 가이드라인

### 1. 인증 (Authentication)

```typescript
// JWT 전략
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}

// Guard 적용
@Controller('users')
export class UserController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return this.userService.getProfile(req.user.userId);
  }
}
```

### 2. 권한 (Authorization)

```typescript
// Role Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRoleEnum[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}

// 사용
@Post('admin/users')
@Roles(UserRoleEnum.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
async createUserByAdmin(@Body() dto: CreateUserReqDto) {
  return this.userService.createUser(dto);
}
```

### 3. 비밀번호 암호화

```typescript
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptHandler {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### 4. 환경 변수

```typescript
// ❌ 하드코딩 금지
const apiKey = 'sk_live_123456789';

// ✅ 환경 변수 사용
@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}

  getApiKey(): string {
    return this.configService.get<string>('PAYMENT_API_KEY');
  }
}
```

### 5. SQL Injection 방지

```typescript
// ❌ 문자열 연결 (위험)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ 파라미터 바인딩
const user = await this.userRepository.createQueryBuilder('user').where('user.email = :email', { email }).getOne();
```

---

## 테스트 전략

### 1. Unit Test (Service)

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  describe('getUserById', () => {
    it('사용자를 반환해야 함', async () => {
      const user = { id: 1, email: 'test@example.com' };
      repository.findOneBy.mockResolvedValue(user);

      const result = await service.getUserById(1);

      expect(result).toEqual(user);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('사용자가 없으면 NotFoundException을 던져야 함', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.getUserById(1)).rejects.toThrow(NotFoundException);
    });
  });
});
```

### 2. E2E Test

```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 로그인하여 토큰 획득
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = response.body.accessToken;
  });

  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## 배포 및 운영

### 1. 환경 구분

```typescript
// .env.development
NODE_ENV = development;
DB_HOST = localhost;
DB_PORT = 3306;

// .env.production
NODE_ENV = production;
DB_HOST = prod - db.example.com;
DB_PORT = 3306;
```

### 2. 로깅

```typescript
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async createUser(dto: CreateUserReqDto) {
    this.logger.log(`사용자 생성 시도: ${dto.email}`);

    try {
      const user = await this.userRepository.save(dto);
      this.logger.log(`사용자 생성 성공: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`사용자 생성 실패: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 3. 헬스 체크

```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db')
  async checkDatabase(@InjectDataSource() dataSource: DataSource) {
    try {
      await dataSource.query('SELECT 1');
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      return { status: 'error', database: 'disconnected' };
    }
  }
}
```

### 4. 성능 모니터링

```typescript
// Interceptor로 응답 시간 측정
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        this.logger.log(`${method} ${url} - ${responseTime}ms`);
      }),
    );
  }
}
```

---

## 부록

### A. 유용한 명령어

```bash
# 개발 서버 실행
pnpm run start:dev peek
pnpm run start:dev peek-admin

# 빌드
pnpm run build

# 프로덕션 실행
pnpm run start:prod peek

# 테스트
pnpm run test
pnpm run test:e2e

# 린트
pnpm run lint
pnpm run format
```

### B. 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 공식 문서](https://typeorm.io/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

### C. 문의

개발 규칙에 대한 문의나 개선 제안은 팀 내부 채널을 통해 논의해주세요.

---

**Last Updated**: 2025년 11월 7일
