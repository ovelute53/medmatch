"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string>("");

  function handleBack() {
    router.back();
  }

  // 비밀번호 강도 체크
  function validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: "비밀번호는 최소 8자 이상이어야 합니다." };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: "비밀번호에 대문자를 포함해야 합니다." };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: "비밀번호에 소문자를 포함해야 합니다." };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: "비밀번호에 숫자를 포함해야 합니다." };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: "비밀번호에 특수문자를 포함해야 합니다." };
    }
    return { valid: true, message: "강력한 비밀번호입니다!" };
  }

  // 비밀번호 변경 시 강도 체크
  function handlePasswordChange(newPassword: string) {
    setForm({ ...form, password: newPassword });
    const strength = validatePassword(newPassword);
    setPasswordStrength(strength.message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const passwordCheck = validatePassword(form.password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      router.push("/auth/signin?registered=true");
    } catch (error) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-burgundy-50 via-rose-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-left mb-4">
          <button
            onClick={handleBack}
            className="text-burgundy-700 hover:text-burgundy-900 inline-flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
        </div>
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-burgundy-700 to-burgundy-900 bg-clip-text text-transparent">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-burgundy-700 hover:text-burgundy-800"
            >
              로그인
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 sm:text-sm"
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 sm:text-sm"
                placeholder="이메일 주소"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 sm:text-sm"
                placeholder="비밀번호 (대문자, 소문자, 숫자, 특수문자 포함 8자 이상)"
              />
              {form.password && (
                <p className={`mt-1 text-xs font-medium ${
                  validatePassword(form.password).valid ? "text-green-600" : "text-orange-600"
                }`}>
                  {passwordStrength}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <p className={form.password.length >= 8 ? "text-green-600 font-medium" : ""}>
                  ✓ 최소 8자 이상
                </p>
                <p className={/[A-Z]/.test(form.password) ? "text-green-600 font-medium" : ""}>
                  ✓ 대문자 포함
                </p>
                <p className={/[a-z]/.test(form.password) ? "text-green-600 font-medium" : ""}>
                  ✓ 소문자 포함
                </p>
                <p className={/[0-9]/.test(form.password) ? "text-green-600 font-medium" : ""}>
                  ✓ 숫자 포함
                </p>
                <p className={/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? "text-green-600 font-medium" : ""}>
                  ✓ 특수문자 포함 (!@#$%^&* 등)
                </p>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 sm:text-sm"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-burgundy-700 hover:bg-burgundy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
