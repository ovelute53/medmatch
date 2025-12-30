import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export type UserRole = "user" | "admin";

/**
 * API 라우트에서 인증 확인
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      ),
      user: null,
    };
  }

  return {
    authorized: true,
    response: null,
    user: {
      id: (session.user as any).id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any).role || "user",
      image: session.user.image,
    },
  };
}

/**
 * API 라우트에서 관리자 권한 확인
 */
export async function requireAdmin() {
  const authResult = await requireAuth();

  if (!authResult.authorized) {
    return authResult;
  }

  if (authResult.user?.role !== "admin") {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      ),
      user: authResult.user,
    };
  }

  return authResult;
}

/**
 * API 라우트에서 특정 역할 확인
 */
export async function requireRole(role: UserRole) {
  const authResult = await requireAuth();

  if (!authResult.authorized) {
    return authResult;
  }

  if (authResult.user?.role !== role) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: `${role} 권한이 필요합니다.` },
        { status: 403 }
      ),
      user: authResult.user,
    };
  }

  return authResult;
}

/**
 * API 라우트에서 본인 또는 관리자 확인
 */
export async function requireOwnerOrAdmin(userId: number | string) {
  const authResult = await requireAuth();

  if (!authResult.authorized) {
    return authResult;
  }

  const isOwner = authResult.user?.id === String(userId);
  const isAdmin = authResult.user?.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "본인 또는 관리자만 접근할 수 있습니다." },
        { status: 403 }
      ),
      user: authResult.user,
    };
  }

  return authResult;
}

