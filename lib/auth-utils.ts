import { auth } from "./auth";


export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role: UserRole;
  image?: string | null;
}

/**
 * 서버 사이드에서 현재 사용자 가져오기
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await auth();
    if (!session?.user) return null;

    return {
      id: (session.user as any).id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any).role || "user",
      image: session.user.image,
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

/**
 * 관리자 권한 확인
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/**
 * 로그인 여부 확인
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * 권한 확인 (특정 역할 필요)
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  if (requiredRole === "admin") {
    return user.role === "admin";
  }

  return true; // user 역할은 로그인만 되어 있으면 됨
}

/**
 * 사용자 자신의 리소스인지 확인
 */
export async function isOwner(userId: number | string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  return user.id === String(userId);
}

/**
 * 관리자이거나 본인의 리소스인지 확인
 */
export async function canAccess(userId: number | string): Promise<boolean> {
  const admin = await isAdmin();
  if (admin) return true;

  return await isOwner(userId);
}

