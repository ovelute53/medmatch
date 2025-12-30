"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

interface Review {
  id: number;
  name: string;
  email: string | null;
  rating: number;
  title: string | null;
  content: string;
  language: string | null;
  isVerified: boolean;
  createdAt: Date;
}

interface ReviewListProps {
  hospitalId: number;
}

export default function ReviewList({ hospitalId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, [hospitalId]);

  async function loadReviews() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/reviews`);
      if (!res.ok) {
        throw new Error("리뷰를 불러오는데 실패했습니다.");
      }
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error: any) {
      console.error("리뷰 로드 오류:", error);
      setError(error.message || "리뷰를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(reviewId: number) {
    if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      return;
    }

    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "리뷰 삭제에 실패했습니다.");
        return;
      }

      // 리뷰 목록에서 제거
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      // 페이지 새로고침으로 평점 업데이트
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("리뷰 삭제 오류:", error);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  const languageLabels: Record<string, string> = {
    ko: "한국어",
    en: "English",
    zh: "中文",
    ja: "日本語",
  };

  if (loading) {
    return <LoadingSpinner size="md" text="리뷰를 불러오는 중..." />;
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>아직 작성된 리뷰가 없습니다.</p>
        <p className="text-sm mt-2">첫 번째 리뷰를 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        리뷰 ({reviews.length}개)
      </h3>
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">{review.name}</span>
                {review.isVerified && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    ✓ 검증됨
                  </span>
                )}
                {review.language && (
                  <span className="text-xs text-gray-500">
                    ({languageLabels[review.language] || review.language})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${
                      star <= review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
                <span className="text-sm text-gray-600 ml-1">{review.rating}점</span>
              </div>
              {review.title && (
                <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <button
                onClick={() => handleDelete(review.id)}
                disabled={deletingId === review.id}
                className="text-xs text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                title="리뷰 삭제"
              >
                {deletingId === review.id ? "삭제 중..." : "🗑️ 삭제"}
              </button>
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
        </div>
      ))}
    </div>
  );
}

