import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// ===== 디버깅: 환경 변수 강제 확인 =====
console.error("==================== AUTH CONFIG START ====================");
console.error("🔍 process.env.GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.error("🔍 process.env.GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "EXISTS" : "UNDEFINED");
console.error("🔍 All env keys:", Object.keys(process.env).filter(k => k.includes('GOOGLE')));
console.error("==================== AUTH CONFIG END ====================");

// Google OAuth 환경 변수 확인
const hasGoogleOAuth = !!(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID.length > 0 &&
  process.env.GOOGLE_CLIENT_SECRET.length > 0
);

const providers: any[] = [
  // 이메일/비밀번호 로그인
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      };
    },
  }),
];

// Google Provider 조건부 추가
if (hasGoogleOAuth) {
  console.log("✅ Google Provider 추가 중...");
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
} else {
  console.log("⚠️  Google OAuth 환경 변수가 설정되지 않았습니다.");
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
};
