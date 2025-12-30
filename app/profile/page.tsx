"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "../_components/LoadingSpinner";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      loadUserReviews();
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

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">내가 작성한 리뷰</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
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
                      <div className="text-right">
                        <span className="text-yellow-500">{review.rating}점</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

