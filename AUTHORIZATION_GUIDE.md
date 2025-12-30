# 권한 관리 가이드

MedMatch 플랫폼의 권한 관리 시스템 사용 가이드입니다.

## 역할 (Roles)

- **user**: 일반 사용자
- **admin**: 관리자

## 클라이언트 사이드 권한 관리

### 1. useAuth 훅 사용

```tsx
import { useAuth, useRequireAdmin } from "@/hooks/useAuth";

function MyComponent() {
  const { user, role, isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <p>환영합니다, {user?.name}님</p>
      {isAdmin && <p>관리자 권한이 있습니다</p>}
    </div>
  );
}

// 관리자 권한 필요
function AdminPage() {
  const { isLoading } = useRequireAdmin();

  if (isLoading) return <LoadingSpinner />;

  return <div>관리자 페이지</div>;
}
```

### 2. RoleGuard 컴포넌트 사용

```tsx
import { RoleGuard, ShowForAdmin, ShowWhenAuthenticated } from "@/app/_components/RoleGuard";

// 로그인 필요한 페이지
function ProfilePage() {
  return (
    <RoleGuard>
      <div>프로필 페이지</div>
    </RoleGuard>
  );
}

// 관리자 전용 페이지
function AdminDashboard() {
  return (
    <RoleGuard requiredRole="admin">
      <div>관리자 대시보드</div>
    </RoleGuard>
  );
}

// 조건부 렌더링
function Header() {
  return (
    <header>
      <ShowWhenAuthenticated>
        <UserMenu />
      </ShowWhenAuthenticated>

      <ShowForAdmin>
        <AdminLink href="/admin">관리자 페이지</AdminLink>
      </ShowForAdmin>
    </header>
  );
}
```

### 3. 컴포넌트별 권한 표시

```tsx
import { ShowForAdmin, ShowForRole, ShowWhenAuthenticated, ShowWhenUnauthenticated } from "@/app/_components/RoleGuard";

function MyPage() {
  return (
    <div>
      {/* 관리자에게만 보임 */}
      <ShowForAdmin>
        <AdminPanel />
      </ShowForAdmin>

      {/* 로그인한 사용자에게만 보임 */}
      <ShowWhenAuthenticated>
        <UserContent />
      </ShowWhenAuthenticated>

      {/* 로그인하지 않은 사용자에게만 보임 */}
      <ShowWhenUnauthenticated>
        <LoginPrompt />
      </ShowWhenUnauthenticated>

      {/* 특정 역할에게만 보임 */}
      <ShowForRole role="admin" fallback={<p>권한이 없습니다</p>}>
        <AdminContent />
      </ShowForRole>
    </div>
  );
}
```

## 서버 사이드 권한 관리

### 1. Server Component에서 권한 확인

```tsx
import { getCurrentUser, isAdmin, hasRole } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  if (!(await isAdmin())) {
    redirect("/");
  }

  return <div>관리자 페이지</div>;
}

// 또는 간단하게
export default async function AdminPage() {
  if (!(await hasRole("admin"))) {
    redirect("/");
  }

  return <div>관리자 페이지</div>;
}
```

### 2. API 라우트에서 권한 확인

```tsx
import { requireAuth, requireAdmin, requireOwnerOrAdmin } from "@/lib/api-auth";
import { NextResponse } from "next/server";

// 로그인 필요
export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  const user = authResult.user;

  return NextResponse.json({ message: `안녕하세요, ${user.name}님` });
}

// 관리자 권한 필요
export async function DELETE(req: Request) {
  const authResult = await requireAdmin();
  if (!authResult.authorized) {
    return authResult.response;
  }

  // 관리자만 실행할 수 있는 작업
  return NextResponse.json({ success: true });
}

// 본인 또는 관리자만 접근 가능
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  const authResult = await requireOwnerOrAdmin(userId);
  if (!authResult.authorized) {
    return authResult.response;
  }

  // 본인 또는 관리자만 실행할 수 있는 작업
  return NextResponse.json({ success: true });
}
```

## 권한 확인 함수

### 클라이언트 사이드

- `useAuth()`: 현재 사용자 정보 및 권한 확인
- `useRequireAuth(role?)`: 특정 권한 필요 (없으면 리다이렉트)
- `useRequireAdmin()`: 관리자 권한 필요 (없으면 리다이렉트)

### 서버 사이드

- `getCurrentUser()`: 현재 로그인한 사용자 가져오기
- `isAuthenticated()`: 로그인 여부 확인
- `isAdmin()`: 관리자 여부 확인
- `hasRole(role)`: 특정 역할 확인
- `isOwner(userId)`: 본인 리소스인지 확인
- `canAccess(userId)`: 본인 또는 관리자인지 확인

### API 라우트

- `requireAuth()`: 로그인 필요
- `requireAdmin()`: 관리자 권한 필요
- `requireRole(role)`: 특정 역할 필요
- `requireOwnerOrAdmin(userId)`: 본인 또는 관리자 필요

## 예제: 전체 페이지 보호

```tsx
// app/admin/layout.tsx
import { RoleGuard } from "@/app/_components/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard requiredRole="admin">
      <div className="admin-layout">
        <AdminSidebar />
        <main>{children}</main>
      </div>
    </RoleGuard>
  );
}
```

## 예제: API 엔드포인트 보호

```tsx
// app/api/admin/hospitals/route.ts
import { requireAdmin } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // 관리자 권한 확인
  const authResult = await requireAdmin();
  if (!authResult.authorized) {
    return authResult.response;
  }

  const body = await req.json();

  const hospital = await prisma.hospital.create({
    data: body,
  });

  return NextResponse.json({ success: true, hospital });
}
```

## 주의사항

1. **클라이언트 사이드 권한 확인은 UI 표시용입니다**. 중요한 보안은 항상 서버 사이드에서 확인하세요.
2. **API 라우트는 반드시 권한 확인을 해야 합니다**. 클라이언트에서 숨겨도 직접 API를 호출할 수 있습니다.
3. **민감한 작업은 관리자 권한을 확인하세요**. (데이터 삭제, 사용자 정보 수정 등)
4. **본인의 리소스만 접근할 수 있도록 하세요**. (프로필 수정, 리뷰 삭제 등)

