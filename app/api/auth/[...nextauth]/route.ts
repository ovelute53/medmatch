import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// NextAuth v5 beta는 handler 객체를 반환합니다
export const GET = handler.handlers?.GET || handler;
export const POST = handler.handlers?.POST || handler;

