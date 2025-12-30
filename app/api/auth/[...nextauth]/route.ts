import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log("🚀 [NEXTAUTH ROUTE] Initializing...");
console.log("🚀 [NEXTAUTH ROUTE] Providers count:", authOptions.providers.length);
console.log("🚀 [NEXTAUTH ROUTE] Provider IDs:", authOptions.providers.map((p: any) => p.id || p.options?.id || 'unknown'));

const handler = NextAuth(authOptions);

// NextAuth v5 beta는 handler 객체를 반환합니다
export const GET = handler.handlers?.GET || handler;
export const POST = handler.handlers?.POST || handler;

