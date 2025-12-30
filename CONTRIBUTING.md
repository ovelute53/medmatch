# Git Flow 가이드

이 프로젝트는 Git Flow 방식을 사용합니다.

## 브랜치 전략

### 주요 브랜치
- `main`: 프로덕션 배포 가능한 안정적인 코드
- `develop`: 개발 중인 기능들이 통합되는 브랜치 (선택사항)

### 보조 브랜치
- `feature/*`: 새로운 기능 개발
- `bugfix/*`: 버그 수정
- `hotfix/*`: 프로덕션 긴급 수정

## 작업 흐름

### 1. 새 기능 개발

```bash
# main 브랜치에서 최신 코드 가져오기
git checkout main
git pull origin main

# 새 feature 브랜치 생성
git checkout -b feature/새기능이름

# 작업 후 커밋
git add .
git commit -m "feat: 새 기능 추가"

# GitHub에 push
git push -u origin feature/새기능이름
```

### 2. Pull Request 생성

1. GitHub에서 `feature/새기능이름` 브랜치로 PR 생성
2. `main` 브랜치로 merge 요청
3. 코드 리뷰 후 merge

### 3. Merge 후 정리

```bash
# main 브랜치로 전환
git checkout main
git pull origin main

# 사용한 feature 브랜치 삭제 (로컬)
git branch -d feature/새기능이름

# 원격 브랜치 삭제 (선택사항)
git push origin --delete feature/새기능이름
```

## 커밋 메시지 컨벤션

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 업데이트, 패키지 매니저 설정 등

예시:
```
feat: 병원 검색 기능 추가
fix: Prisma Client 타입 오류 수정
docs: README 업데이트
```

## 주의사항

- `main` 브랜치에 직접 push하지 마세요
- feature 브랜치에서 작업 후 PR을 통해 merge하세요
- 작업 전 항상 최신 main 브랜치를 pull 받으세요
- 하나의 feature 브랜치에는 하나의 기능만 작업하세요

