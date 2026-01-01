# Git Flow 작업 가이드

## 브랜치 구조

- **main**: 프로덕션 브랜치 (안정적인 릴리스 버전)
- **develop**: 개발 브랜치 (기능 개발의 기본 브랜치)
- **feature/***: 기능 개발 브랜치
- **release/***: 릴리스 준비 브랜치
- **hotfix/***: 긴급 수정 브랜치

## 일반적인 작업 흐름

### 1. 기능 개발 (Feature)

```bash
# develop 브랜치로 이동
git checkout develop
git pull origin develop

# 새 기능 브랜치 생성
git checkout -b feature/기능명

# 작업 및 커밋
git add .
git commit -m "feat: 기능 설명"

# develop에 병합
git checkout develop
git merge feature/기능명
git push origin develop

# 기능 브랜치 삭제
git branch -d feature/기능명
```

### 2. 릴리스 준비 (Release)

```bash
# develop에서 release 브랜치 생성
git checkout develop
git checkout -b release/1.0.0

# 버그 수정 및 버전 업데이트
git add .
git commit -m "chore: 버전 1.0.0 준비"

# main에 병합 (릴리스)
git checkout main
git merge release/1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# develop에도 병합
git checkout develop
git merge release/1.0.0
git push origin develop

# release 브랜치 삭제
git branch -d release/1.0.0
git push origin --delete release/1.0.0
```

### 3. 긴급 수정 (Hotfix)

```bash
# main에서 hotfix 브랜치 생성
git checkout main
git checkout -b hotfix/1.0.1

# 긴급 수정
git add .
git commit -m "fix: 긴급 수정 내용"

# main에 병합
git checkout main
git merge hotfix/1.0.1
git tag -a v1.0.1 -m "Hotfix version 1.0.1"
git push origin main --tags

# develop에도 병합
git checkout develop
git merge hotfix/1.0.1
git push origin develop

# hotfix 브랜치 삭제
git branch -d hotfix/1.0.1
git push origin --delete hotfix/1.0.1
```

## 커밋 메시지 규칙

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 설정, 패키지 관리 등

예: `feat: 리뷰 이미지 업로드 기능 추가`

## 현재 브랜치 확인

```bash
git branch --show-current
```

## 브랜치 목록 확인

```bash
git branch -a
```
