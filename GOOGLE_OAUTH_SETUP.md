# 🚀 Google 소셜 로그인 빠른 설정 가이드

소셜 로그인 창이 뜨도록 하려면 Google OAuth 클라이언트를 설정해야 합니다.

## 1️⃣ Google Cloud Console 설정 (5분 소요)

### 단계 1: 프로젝트 생성
1. 🔗 [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 상단의 프로젝트 선택 드롭다운 클릭 → "새 프로젝트" 선택
3. 프로젝트 이름: `MedMatch` 입력 → "만들기" 클릭

### 단계 2: OAuth 동의 화면 구성
1. 왼쪽 메뉴 → "API 및 서비스" → "OAuth 동의 화면" 클릭
2. User Type: **외부** 선택 → "만들기" 클릭
3. 앱 정보 입력:
   - 앱 이름: `MedMatch`
   - 사용자 지원 이메일: (본인 이메일)
   - 개발자 연락처 정보: (본인 이메일)
4. "저장 후 계속" 클릭
5. 범위 추가 화면: "저장 후 계속" (기본값 사용)
6. 테스트 사용자: 본인 Gmail 주소 추가 → "저장 후 계속"
7. "대시보드로 돌아가기" 클릭

### 단계 3: OAuth 클라이언트 ID 생성
1. 왼쪽 메뉴 → "사용자 인증 정보" 클릭
2. 상단의 "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID" 선택
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름: `MedMatch Web Client`
5. **승인된 리디렉션 URI** 섹션:
   - "+ URI 추가" 클릭
   - 입력: `http://localhost:3000/api/auth/callback/google`
6. "만들기" 클릭
7. 🎉 **클라이언트 ID와 클라이언트 보안 비밀번호가 표시됩니다**
   - 이 값들을 복사해둡니다 (나중에도 확인 가능)

## 2️⃣ 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 추가하세요:

```bash
# 터미널에서 실행
cd /home/ovelu/.cursor/worktrees/medmatch__WSL__Ubuntu-24.04_/icg
nano .env
```

`.env` 파일 내용:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js Secret (아래 명령어로 생성)
# openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (위에서 복사한 값 붙여넣기)
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"
```

### NextAuth Secret 생성:
```bash
openssl rand -base64 32
```
이 명령어로 생성된 값을 `NEXTAUTH_SECRET`에 붙여넣으세요.

## 3️⃣ 개발 서버 재시작

```bash
# Ctrl+C로 서버 중지 후
npm run dev
```

## 4️⃣ 테스트

1. 브라우저에서 `http://localhost:3000/auth/signin` 접속
2. **"Google로 계속하기"** 버튼이 나타납니다 ✅
3. 버튼 클릭 시 Google 로그인 창이 팝업됩니다 🎉
4. Gmail 계정으로 로그인하면 자동으로 회원가입 및 로그인됩니다

## ⚠️ 주의사항

- **테스트 모드**: OAuth 동의 화면이 "테스트" 모드이므로, 추가한 테스트 사용자만 로그인 가능합니다
- **프로덕션 배포 시**: Google OAuth 앱을 "프로덕션"으로 승인 신청해야 합니다
- **.env 파일 보안**: `.env` 파일은 절대 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)

## 🔧 문제 해결

### 버튼이 안 보이는 경우
```bash
# 환경 변수 확인
cat .env | grep GOOGLE
```

### "redirect_uri_mismatch" 에러
- Google Cloud Console에서 리디렉션 URI가 정확히 `http://localhost:3000/api/auth/callback/google`인지 확인
- 대소문자, 슬래시(/) 하나도 정확히 일치해야 함

### "Access blocked: This app's request is invalid" 에러
- OAuth 동의 화면에서 본인 Gmail을 테스트 사용자로 추가했는지 확인

---

## 📱 다른 소셜 로그인 추가

Google 설정이 완료되면 `SOCIAL_LOGIN_SETUP.md` 파일을 참고하여 Facebook, Apple, Line도 추가할 수 있습니다.

