"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "../_components/LoadingSpinner";

type Tab = "profile" | "reviews" | "settings";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // 프로필 폼
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    image: "",
  });

  // 비밀번호 변경 폼
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      setProfileForm({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      });
      
      if (activeTab === "reviews") {
        loadUserReviews();
      }
    }
  }, [session, status, router, activeTab]);

  async function loadUserReviews() {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("리뷰 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "업데이트 실패" });
        return;
      }

      setMessage({ type: "success", text: "프로필이 업데이트되었습니다." });
      
      // 세션 업데이트
      await update({
        ...session,
        user: {
          ...session.user,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
        },
      });
    } catch (error) {
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "비밀번호는 최소 6자 이상이어야 합니다." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "비밀번호 변경 실패" });
        return;
      }

      setMessage({ type: "success", text: "비밀번호가 변경되었습니다." });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="로딩 중..." />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isSocialLogin = !session.user?.email?.includes("@") || session.user?.image?.includes("googleusercontent");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ""}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {session.user?.name?.[0] || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{session.user?.name}</h1>
                  <p className="text-gray-600">{session.user?.email}</p>
                  {session.user?.role === "admin" && (
                    <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded mt-1">
                      관리자
                    </span>
                  )}
                </div>
              </div>
              {session.user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  관리자 페이지
                </Link>
              )}
            </div>
          </div>

          {/* 탭 */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "profile"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  프로필 정보
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "reviews"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  내 리뷰
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "settings"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  설정
                </button>
              </nav>
            </div>

            <div className="p-6">
              {message && (
                <div
                  className={`mb-4 p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* 프로필 정보 탭 */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      프로필 이미지 URL (선택사항)
                    </label>
                    <input
                      type="url"
                      value={profileForm.image}
                      onChange={(e) => setProfileForm({ ...profileForm, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "저장 중..." : "프로필 업데이트"}
                  </button>
                </form>
              )}

              {/* 내 리뷰 탭 */}
              {activeTab === "reviews" && (
                <div>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner text="리뷰 로딩 중..." />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">작성한 리뷰가 없습니다.</p>
                      <Link
                        href="/"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        병원 둘러보기
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link
                                href={`/hospitals/${review.hospitalId}`}
                                className="text-blue-600 hover:text-blue-800 font-medium text-lg"
                              >
                                {review.hospital?.name}
                              </Link>
                              {review.title && (
                                <h3 className="font-medium text-gray-900 mt-2">{review.title}</h3>
                              )}
                              <p className="text-gray-600 mt-2">{review.content}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <span className="text-yellow-500 font-medium">⭐ {review.rating}점</span>
                                <span>{new Date(review.createdAt).toLocaleDateString("ko-KR")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 설정 탭 */}
              {activeTab === "settings" && (
                <div className="space-y-8">
                  {/* 비밀번호 변경 */}
                  {!isSocialLogin && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            현재 비밀번호
                          </label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            새 비밀번호
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            minLength={6}
                            required
                          />
                          <p className="text-sm text-gray-500 mt-1">최소 6자 이상</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            새 비밀번호 확인
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {saving ? "변경 중..." : "비밀번호 변경"}
                        </button>
                      </form>
                    </div>
                  )}

                  {isSocialLogin && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.
                      </p>
                    </div>
                  )}

                  {/* 로그아웃 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 관리</h3>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
