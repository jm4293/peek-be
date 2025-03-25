

## Monorepo 구조 변경 

1. 서비스(NsetJS) 서버, 어드민(NestJS) 서버, 데이터베이스(MySQL) 구성으로 진행 중에서 공통 ENUM 값 및 디비 entity, repository를 변경할 때마다 각각의 서버 코드를 같게 수정해야하는 불편함 및 디비 관리의 어려움을 느낌
2. NestJS 버전 및 라이브러리 버전에 따라 사용방법이 달라졌던 경우에 불편함을 느낌

- Monorepo 구조로 변경을 결심하게 되어 ENUM, 디비 entity, repository를 공통으로 관리하기 위해서 모노레포 구조로 변경 결심
- 진행하면서 패키지 매저니를 npm 사용 중이였지만 pnpm으로 변경하여 node module 또한 각각 프로젝트에 생성하는 것이 아닌 프로젝트 루트에 생성하여 관리하기로 결정

## 진행 방식

1. pnpm 설치
   - 글로벌로 pnpm 설치
    ```
    npm i -g pnpm
    ```
   
1. 기존 폴더 구조
   1. 서비스 코드
   

1. 모노레포 루트로 사용할 폴더 생성
   1. apps
      1. 서비스 코드
         - 서비스 서버
           - 기존에 사용하던 서비스 코드 중 src 폴더만 복사
         - 어드민 서버
           - 기존에 사용하던 어드민 코드 중 src 폴더만 복사
   2. libs
      1. 공통 코드
         - constant, ENUM 및 공통 함수
         - database, entity, repository
   3. package.json
   4. tsconfig.json
   5. tsconfig.build.json