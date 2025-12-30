# 소셜 로그인 설정 가이드

MedMatch 플랫폼에서 지원하는 소셜 로그인 프로바이더 설정 방법입니다.

## 지원하는 소셜 로그인

- ✅ Google
- ✅ Facebook (Instagram도 Facebook OAuth 사용)
- ✅ Apple
- ✅ Line (일본, 태국, 대만에서 인기)
- ⏳ WeChat (중국) - 추후 커스텀 구현 필요

## 1. Google OAuth 설정

### 1.1 Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션" 선택
6. 승인된 리디렉션 URI 추가:
   - 개발: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://yourdomain.com/api/auth/callback/google`
7. 클라이언트 ID와 클라이언트 보안 비밀번호 복사

### 1.2 환경 변수 설정

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 2. Facebook OAuth 설정

### 2.1 Facebook Developers 설정

1. [Facebook Developers](https://developers.facebook.com/) 접속
2. "내 앱" > "앱 만들기" 선택
3. 사용 사례: "비즈니스"
4. 앱 유형: "소비자"
5. 앱 이름 입력 및 생성
6. "Facebook 로그인" > "설정" 이동
7. 유효한 OAuth 리디렉션 URI 추가:
   - 개발: `http://localhost:3000/api/auth/callback/facebook`
   - 프로덕션: `https://yourdomain.com/api/auth/callback/facebook`
8. "설정" > "기본" 에서 앱 ID와 앱 시크릿 코드 복사

### 2.2 환경 변수 설정

```env
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

### 2.3 Instagram 로그인

Instagram은 Facebook OAuth를 사용합니다. Facebook 로그인이 설정되면 자동으로 작동합니다.

## 3. Apple OAuth 설정

### 3.1 Apple Developer 설정

1. [Apple Developer](https://developer.apple.com/) 접속
2. "Certificates, Identifiers & Profiles" 이동
3. "Identifiers" > "+" 버튼 클릭
4. "App IDs" 선택 및 "Sign In with Apple" 활성화
5. "Services ID" 생성:
   - Identifier 입력 (예: `com.yourdomain.medmatch`)
   - "Sign In with Apple" 체크
   - 도메인 및 리턴 URL 설정:
     - 도메인: `yourdomain.com` (localhost는 불가)
     - 리턴 URL: `https://yourdomain.com/api/auth/callback/apple`
6. Key 생성:
   - "Keys" > "+" 버튼
   - "Sign In with Apple" 활성화
   - Key ID와 .p8 파일 다운로드

### 3.2 환경 변수 설정

```env
APPLE_CLIENT_ID="com.yourdomain.medmatch"
APPLE_CLIENT_SECRET="your-apple-client-secret"
```

**참고**: Apple OAuth는 localhost에서 테스트할 수 없으며, HTTPS가 필수입니다.

## 4. Line OAuth 설정

### 4.1 Line Developers 설정

1. [Line Developers Console](https://developers.line.biz/console/) 접속
2. "Create a new provider" 또는 기존 provider 선택
3. "Create a new channel" 선택
4. Channel type: "LINE Login" 선택
5. 필수 정보 입력:
   - Channel name
   - Channel description
   - App types (Web app 선택)
6. "LINE Login" 탭에서 설정:
   - Callback URL 추가:
     - 개발: `http://localhost:3000/api/auth/callback/line`
     - 프로덕션: `https://yourdomain.com/api/auth/callback/line`
7. "Basic settings" 탭에서 Channel ID와 Channel secret 복사

### 4.2 환경 변수 설정

```env
LINE_CLIENT_ID="your-line-channel-id"
LINE_CLIENT_SECRET="your-line-channel-secret"
```

## 5. WeChat OAuth (추후 구현)

WeChat은 중국 사용자를 위한 소셜 로그인입니다. WeChat OAuth는 특별한 커스텀 구현이 필요합니다.

### 5.1 WeChat Open Platform 설정

1. [WeChat Open Platform](https://open.weixin.qq.com/) 접속
2. 계정 등록 (중국 사업자 등록증 필요)
3. 웹사이트 애플리케이션 등록
4. AppID와 AppSecret 발급

### 5.2 구현 예정

WeChat OAuth는 NextAuth.js의 기본 프로바이더가 아니므로, 커스텀 프로바이더 구현이 필요합니다.

## 6. 데이터베이스 스키마 업데이트

소셜 로그인을 위해 Prisma 스키마에 다음 모델이 추가되어야 합니다:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            Int
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

## 7. 테스트

### 로컬 개발 환경

1. `.env` 파일에 OAuth 자격 증명 추가
2. 개발 서버 재시작: `npm run dev`
3. `http://localhost:3000/auth/signin` 접속
4. 각 소셜 로그인 버튼 테스트

### 프로덕션 배포

1. 각 OAuth 프로바이더에서 프로덕션 도메인 추가
2. 환경 변수 설정 (Vercel, Netlify 등)
3. HTTPS 필수 (특히 Apple OAuth)

## 8. 보안 고려사항

- ⚠️ OAuth 클라이언트 시크릿은 절대 공개 저장소에 커밋하지 마세요
- ⚠️ 프로덕션 환경에서는 강력한 `NEXTAUTH_SECRET` 사용
- ⚠️ HTTPS 사용 필수
- ⚠️ CORS 설정 확인
- ⚠️ 리디렉션 URI는 정확히 일치해야 함

## 9. 문제 해결

### "Redirect URI mismatch" 오류

- OAuth 프로바이더 콘솔에서 리디렉션 URI가 정확한지 확인
- 프로토콜(http/https), 포트 번호, 경로가 정확한지 확인

### "Invalid client" 오류

- 클라이언트 ID와 시크릿이 올바른지 확인
- 환경 변수가 제대로 로드되었는지 확인

### Apple OAuth 테스트 불가

- Apple OAuth는 localhost에서 작동하지 않음
- ngrok 또는 Vercel Preview 배포를 통해 테스트

## 10. 참고 자료

- [NextAuth.js 공식 문서](https://next-auth.js.org/)
- [Google OAuth 가이드](https://developers.google.com/identity/protocols/oauth2)
- [Facebook OAuth 가이드](https://developers.facebook.com/docs/facebook-login/web)
- [Apple OAuth 가이드](https://developer.apple.com/sign-in-with-apple/)
- [Line OAuth 가이드](https://developers.line.biz/en/docs/line-login/)

