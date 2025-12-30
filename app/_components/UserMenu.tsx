"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="px-3 py-2 text-sm text-gray-600">
        로딩 중...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/auth/signin"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          로그인
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 text-sm font-medium text-white bg-burgundy-700 rounded-lg hover:bg-burgundy-800 shadow-md"
        >
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100"
      >
        <span>{session.user?.name || session.user?.email}</span>
        {session.user?.role === "admin" && (
          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
            관리자
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              프로필
            </Link>
            {session.user?.role === "admin" && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                관리자 페이지
              </Link>
            )}
            <button
              onClick={async () => {
                setIsOpen(false);
                try {
                  await signOut({ 
                    redirect: false,
                    callbackUrl: "/" 
                  });
                  // 로그아웃 후 명시적으로 홈페이지로 리다이렉트
                  window.location.href = "/";
                } catch (error) {
                  console.error("로그아웃 오류:", error);
                  // 에러가 발생해도 홈페이지로 이동
                  window.location.href = "/";
                }
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}

