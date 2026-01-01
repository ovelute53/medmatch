"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  name: string;
  image: string | null;
  createdAt: string;
}

interface Stats {
  reviewCount: number;
  favoriteCount: number;
  qnaCount: number;
}

interface Hospital {
  id: number;
  name: string;
  nameEn: string | null;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number;
  address: string;
  city: string | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  hospital: {
    id: number;
    name: string;
    nameEn: string | null;
    imageUrl: string | null;
  };
}

interface QnA {
  id: number;
  title: string;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    user: User;
    stats: Stats;
    recentReviews: Review[];
    recentFavorites: Hospital[];
    recentQnAs: QnA[];
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user) {
      loadProfile();
    }
  }, [status, session]);

  async function loadProfile() {
    if (!session?.user) return;

    setLoading(true);
    try {
      const userId = (session.user as any).id;
      const res = await fetch(`/api/users/${userId}/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else if (res.status === 401 || res.status === 403) {
        router.push("/api/auth/signin");
      }
    } catch (error) {
      console.error("프로필 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 프로필</h1>
        </div>

        {/* 사용자 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-6">
              <div className="relative">
                {profile.user.image ? (
                  <img
                    src={profile.user.image}
                    alt={profile.user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-primary-100">
                    {profile.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.user.name}</h2>
                <p className="text-gray-600 mb-4">{profile.user.email}</p>
                <p className="text-sm text-gray-500">
                  가입일: {new Date(profile.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/profile/reviews"
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">작성한 리뷰</p>
                <p className="text-3xl font-bold text-primary-600">{profile.stats.reviewCount}</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </Link>

          <Link
            href="/profile/favorites"
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">즐겨찾기</p>
                <p className="text-3xl font-bold text-primary-600">{profile.stats.favoriteCount}</p>
              </div>
              <div className="text-4xl">❤️</div>
            </div>
          </Link>

          <Link
            href="/profile/qnas"
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">작성한 Q&A</p>
                <p className="text-3xl font-bold text-primary-600">{profile.stats.qnaCount}</p>
              </div>
              <div className="text-4xl">💬</div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 작성한 리뷰 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">최근 작성한 리뷰</h3>
                <Link
                  href="/profile/reviews"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  전체 보기 →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {profile.recentReviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">⭐</div>
                  <p className="text-gray-600">작성한 리뷰가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.recentReviews.map((review) => (
                    <Link
                      key={review.id}
                      href={`/hospitals/${review.hospital.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {review.hospital.imageUrl && (
                          <img
                            src={review.hospital.imageUrl}
                            alt={review.hospital.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {review.hospital.name}
                          </h4>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < review.rating ? "text-yellow-400" : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                            {review.comment}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 즐겨찾기 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">즐겨찾기</h3>
                <Link
                  href="/profile/favorites"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  전체 보기 →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {profile.recentFavorites.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">❤️</div>
                  <p className="text-gray-600">즐겨찾기가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.recentFavorites.map((hospital) => (
                    <Link
                      key={hospital.id}
                      href={`/hospitals/${hospital.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {hospital.imageUrl && (
                          <img
                            src={hospital.imageUrl}
                            alt={hospital.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {hospital.name}
                          </h4>
                          {hospital.rating && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-primary-600">
                                ⭐ {hospital.rating.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                리뷰 {hospital.reviewCount}개
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-gray-600 truncate">
                            {hospital.city && `${hospital.city}, `}
                            {hospital.address}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 최근 작성한 Q&A */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">최근 작성한 Q&A</h3>
                <Link
                  href="/profile/qnas"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  전체 보기 →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {profile.recentQnAs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-gray-600">작성한 Q&A가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.recentQnAs.map((qna) => (
                    <Link
                      key={qna.id}
                      href={`/qna/${qna.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">{qna.title}</h4>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                qna.status === "answered"
                                  ? "bg-green-100 text-green-700"
                                  : qna.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {qna.status === "answered"
                                ? "답변 완료"
                                : qna.status === "pending"
                                ? "답변 대기"
                                : "종료"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(qna.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
