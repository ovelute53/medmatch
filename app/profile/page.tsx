"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "../_components/LoadingSpinner";
import NotificationSettings from "../_components/NotificationSettings";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("reviews");
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      loadUserReviews();
      loadUserFavorites();
    }
  }, [session, status, router]);

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

  async function loadUserFavorites() {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/users/${session.user.id}/favorites`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("즐겨찾기 로드 오류:", error);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="로딩 중..." />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">프로필</h1>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">이름</label>
                <p className="text-gray-900">{session.user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">이메일</label>
                <p className="text-gray-900">{session.user?.email}</p>
              </div>
              {session.user?.role === "admin" && (
                <div>
                  <label className="text-sm font-medium text-gray-500">권한</label>
                  <p className="text-gray-900">
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      관리자
                    </span>
                  </p>
                </div>
              )}
            </div>
            {session.user?.role === "admin" && (
              <div className="mt-6">
                <Link
                  href="/admin"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  관리자 페이지로 이동
                </Link>
              </div>
            )}
          </div>

          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`
                    ${
                      activeTab === "reviews"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  내 리뷰 ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`
                    ${
                      activeTab === "favorites"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  즐겨찾기 ({favorites.length})
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`
                    ${
                      activeTab === "notifications"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  알림 설정
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "reviews" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">내가 작성한 리뷰</h2>
                  {reviews.length === 0 ? (
                    <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link
                                href={`/hospitals/${review.hospitalId}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {review.hospital?.name}
                              </Link>
                              {review.title && (
                                <h3 className="font-medium text-gray-900 mt-1">{review.title}</h3>
                              )}
                              <p className="text-gray-600 text-sm mt-1">{review.content}</p>
                              <p className="text-gray-500 text-xs mt-2">
                                {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <span className="text-yellow-500 font-semibold">{review.rating}점</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "favorites" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">즐겨찾는 병원</h2>
                  {favorites.length === 0 ? (
                    <p className="text-gray-500">즐겨찾기한 병원이 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((favorite) => (
                        <Link
                          key={favorite.id}
                          href={`/hospitals/${favorite.hospital.id}`}
                          className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {favorite.hospital.name}
                              </h3>
                              {favorite.hospital.nameEn && (
                                <p className="text-sm text-gray-600">{favorite.hospital.nameEn}</p>
                              )}
                              <p className="text-sm text-gray-500 mt-2">
                                {favorite.hospital.city && `${favorite.hospital.city} · `}
                                {favorite.hospital.address}
                              </p>
                              {favorite.hospital.departments && favorite.hospital.departments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {favorite.hospital.departments.slice(0, 3).map((dept: any) => (
                                    <span
                                      key={dept.id}
                                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                                    >
                                      {dept.department.name}
                                    </span>
                                  ))}
                                  {favorite.hospital.departments.length > 3 && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                      +{favorite.hospital.departments.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {favorite.hospital.rating !== null && favorite.hospital.rating > 0 && (
                              <div className="text-right ml-4">
                                <div className="text-yellow-500 text-sm">⭐</div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {favorite.hospital.rating.toFixed(1)}
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">알림 설정</h2>
                  <NotificationSettings />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
