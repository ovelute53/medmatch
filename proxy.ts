import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  // NextAuth API 경로는 proxy에서 제외
  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/admin");
  const isLoginPage = req.nextUrl.pathname.startsWith("/admin/login");

  // 관리자 페이지 접근 시 인증 확인
  if (isAdminRoute || isApiAdminRoute) {
    if (!token) {
      // 로그인 페이지가 아니면 로그인 페이지로 리다이렉트
      if (!isLoginPage) {
        const signInUrl = new URL("/admin/login", req.url);
        signInUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(signInUrl);
      }
      return NextResponse.next(); // 로그인 페이지는 통과
    }

    // 관리자 권한 확인
    if (token.role !== "admin") {
      // 관리자가 아닌 경우 홈으로 리다이렉트
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};

