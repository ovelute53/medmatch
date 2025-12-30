# MedMatch - 외국인 환자 맞춤 병원 매칭 플랫폼

외국인 환자들을 대상으로 다양한 진료과의 병원을 검색하고 매칭시켜주는 웹 애플리케이션입니다. 강남언니 앱을 모티브로 제작되었습니다.

## 주요 기능

- 🏥 **병원 검색 및 필터링**: 진료과, 도시별로 병원 검색
- 🔍 **실시간 검색**: 병원명, 주소, 설명으로 검색
- 📋 **진료과별 분류**: 다양한 진료과별 병원 목록 제공
- 📝 **진료 문의**: 병원별 문의 및 예약 요청
- 🌐 **다국어 지원**: 한국어/영어 병원 정보 및 다국어 문의 지원
- ⭐ **평점 시스템**: 병원 평점 및 리뷰 수 표시
- 🎨 **모던한 UI**: Tailwind CSS 기반 반응형 디자인

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **데이터베이스**: SQLite (Prisma ORM)
- **스타일링**: Tailwind CSS 4
- **폰트**: Geist Sans, Geist Mono

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 데이터베이스 URL을 설정하세요:

```env
DATABASE_URL="file:./prisma/dev.db"
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma db push
npx prisma generate
```

### 4. 샘플 데이터 생성 (선택사항)

개발 및 테스트를 위한 샘플 데이터를 생성합니다:

```bash
npm run db:seed
```

이 명령은 다음을 생성합니다:
- 10개의 진료과 (내과, 외과, 정형외과 등)
- 6개의 병원 (서울대학교병원, 삼성서울병원 등)

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
medmatch/
├── app/
│   ├── api/              # API 라우트
│   │   ├── hospitals/    # 병원 관련 API
│   │   └── departments/  # 진료과 관련 API
│   ├── admin/            # 관리자 페이지
│   │   ├── hospitals/    # 병원 관리
│   │   └── departments/  # 진료과 관리
│   ├── hospitals/        # 병원 목록 및 상세 페이지
│   └── page.tsx          # 메인 홈페이지
├── prisma/
│   └── schema.prisma     # 데이터베이스 스키마
└── lib/
    └── prisma.ts         # Prisma 클라이언트 설정
```

## 데이터베이스 모델

### Hospital (병원)
- 기본 정보: 이름, 주소, 전화번호, 웹사이트
- 다국어 지원: 한국어/영어 이름 및 설명
- 위치 정보: 국가, 도시
- 평점: 평점 및 리뷰 수
- 진료과: 다대다 관계로 여러 진료과 연결

### Department (진료과)
- 이름: 한국어/영어
- 아이콘: 이모지 또는 이미지 URL
- 설명

### Request (문의)
- 병원별 문의 및 예약 요청
- 환자 정보: 이름, 전화번호, 이메일
- 선호 언어
- 희망 일시 (예약 시)

## 주요 페이지

- `/` - 메인 홈페이지 (병원 검색 및 목록)
- `/hospitals` - 전체 병원 목록
- `/hospitals/[id]` - 병원 상세 페이지 및 문의 폼
- `/admin` - 관리자 대시보드
- `/admin/hospitals/new` - 병원 등록
- `/admin/departments/new` - 진료과 등록
- `/admin/requests` - 문의 내역 확인

## API 엔드포인트

- `GET /api/hospitals` - 병원 목록 조회 (검색/필터링 지원)
- `GET /api/departments` - 진료과 목록 조회
- `POST /api/admin/hospitals` - 병원 등록
- `POST /api/departments` - 진료과 등록
- `POST /api/hospitals/[id]/requests` - 병원 문의 전송

## 개발 가이드

### 새로운 진료과 추가

1. 관리자 페이지(`/admin/departments/new`)에서 진료과 등록
2. 또는 API를 통해 직접 추가

### 병원 등록

1. 관리자 페이지(`/admin/hospitals/new`)에서 병원 정보 입력
2. 진료과 선택
3. 저장

### 데이터베이스 확인

Prisma Studio를 사용하여 데이터베이스를 시각적으로 확인할 수 있습니다:

```bash
npx prisma studio
```

## 라이선스

이 프로젝트는 개인 프로젝트입니다.
