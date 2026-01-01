"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, ReactNode } from "react";
import LoadingSpinner from "./LoadingSpinner";

type UserRole = "user" | "admin";

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * 권한 기반 컴포넌트 보호
 * 
 * @example
 * // 로그인 필요
 * <RoleGuard>
 *   <ProtectedContent />
 * </RoleGuard>
 * 
 * // 관리자 권한 필요
 * <RoleGuard requiredRole="admin">
 *   <AdminContent />
 * </RoleGuard>
 */
export function RoleGuard({ 
  children, 
  requiredRole, 
  fallback = null,
  redirectTo 
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // 로그인 안 됨
    if (status === "unauthenticated") {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push("/auth/signin");
      }
      return;
    }

    // 특정 역할 필요
    if (requiredRole && session?.user) {
      const userRole = (session.user as any).role;
      if (userRole !== requiredRole) {
        if (redirectTo) {
          router.push(redirectTo);
        } else if (requiredRole === "admin") {
          router.push("/");
        }
      }
    }
  }, [status, session, requiredRole, redirectTo, router]);

  // 로딩 중
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="권한 확인 중..." />
      </div>
    );
  }

  // 로그인 안 됨
  if (status === "unauthenticated") {
    return fallback as React.ReactElement;
  }

  // 권한 없음
  if (requiredRole && session?.user) {
    const userRole = (session.user as any).role;
    if (userRole !== requiredRole) {
      return fallback as React.ReactElement;
    }
  }

  return <>{children}</>;
}

interface ShowForRoleProps {
  children: ReactNode;
  role: UserRole;
  fallback?: ReactNode;
}

/**
 * 특정 역할에게만 보이는 컴포넌트
 * 
 * @example
 * <ShowForRole role="admin">
 *   <AdminButton />
 * </ShowForRole>
 */
export function ShowForRole({ children, role, fallback = null }: ShowForRoleProps) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session) return fallback as React.ReactElement;

  const userRole = (session.user as any).role;
  if (userRole === role) {
    return <>{children}</>;
  }

  return fallback as React.ReactElement;
}

/**
 * 관리자에게만 보이는 컴포넌트
 */
export function ShowForAdmin({ children, fallback = null }: Omit<ShowForRoleProps, "role">) {
  return <ShowForRole role="admin" fallback={fallback}>{children}</ShowForRole>;
}

/**
 * 로그인한 사용자에게만 보이는 컴포넌트
 */
export function ShowWhenAuthenticated({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { status } = useSession();

  if (status === "loading") return null;
  if (status === "authenticated") {
    return <>{children}</>;
  }

  return fallback as React.ReactElement;
}

/**
 * 로그인하지 않은 사용자에게만 보이는 컴포넌트
 */
export function ShowWhenUnauthenticated({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    return <>{children}</>;
  }

  return null;
}

