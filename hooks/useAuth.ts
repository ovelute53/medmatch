import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export type UserRole = "user" | "admin";

export function useAuth(requiredRole?: UserRole) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const userRole = (user as any)?.role as UserRole | undefined;

  useEffect(() => {
    if (isLoading) return;

    // 로그인 필요
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    // 특정 역할 필요
    if (requiredRole && userRole !== requiredRole) {
      if (requiredRole === "admin") {
        router.push("/"); // 관리자 아니면 홈으로
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, userRole, router]);

  return {
    user,
    role: userRole,
    isLoading,
    isAuthenticated,
    isAdmin: userRole === "admin",
    isUser: userRole === "user",
  };
}

export function useRequireAuth(requiredRole?: UserRole) {
  return useAuth(requiredRole);
}

export function useRequireAdmin() {
  return useAuth("admin");
}

