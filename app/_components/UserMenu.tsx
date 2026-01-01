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
      <div className="flex items-center space-x-3">
        <Link
          href="/auth/signin"
          className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          로그인
        </Link>
        <Link
          href="/auth/register"
          className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
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
        className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300"
      >
        <span>{session.user?.name || session.user?.email}</span>
        {session.user?.role === "admin" && (
          <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-700 rounded-lg border border-purple-200">
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
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-100">
            <Link
              href="/profile"
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium transition-colors rounded-lg mx-1"
              onClick={() => setIsOpen(false)}
            >
              프로필
            </Link>
            {session.user?.role === "admin" && (
              <Link
                href="/admin"
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium transition-colors rounded-lg mx-1"
                onClick={() => setIsOpen(false)}
              >
                관리자 페이지
              </Link>
            )}
            <div className="border-t border-gray-100 my-1"></div>
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
              className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors rounded-lg mx-1"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}

