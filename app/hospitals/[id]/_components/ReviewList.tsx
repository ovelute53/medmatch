"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import StarRating from "@/app/_components/StarRating";
import EditReviewForm from "./EditReviewForm";
import Pagination from "@/app/_components/Pagination";
import ReportReviewModal from "./ReportReviewModal";
import ReviewLikeButton from "@/app/_components/ReviewLikeButton";
import ReviewImageGallery from "@/app/_components/ReviewImageGallery";
import ReviewComments from "@/app/_components/ReviewComments";

interface Review {
  id: number;
  name: string;
  email: string | null;
  rating: number;
  title: string | null;
  content: string;
  language: string | null;
  isVerified: boolean;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  createdAt: Date;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ReviewListProps {
  hospitalId: number;
}

type SortOption = "latest" | "oldest" | "ratingHigh" | "ratingLow";

export default function ReviewList({ hospitalId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  useEffect(() => {
    loadReviews();
  }, [hospitalId, sortBy, page]);

  async function loadReviews() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        sortBy,
        page: page.toString(),
        limit: "10",
      });
      const res = await fetch(`/api/hospitals/${hospitalId}/reviews?${params}`);
      if (!res.ok) {
        throw new Error("리뷰를 불러오는데 실패했습니다.");
      }
      const data = await res.json();
      if (data.reviews) {
        // rating 값을 명시적으로 Number로 변환
        const reviewsWithNumericRating = data.reviews.map((review: any) => {
          const numericRating = Number(review.rating);
          // 디버깅: rating 값 확인
          if (isNaN(numericRating)) {
            console.warn("Invalid rating value:", review.rating, "for review:", review.id);
          }
          return {
            ...review,
            rating: numericRating,
          };
        });
        setReviews(reviewsWithNumericRating);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (error: any) {
      console.error("리뷰 로드 오류:", error);
      setError(error.message || "리뷰를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleSortChange(newSortBy: SortOption) {
    setSortBy(newSortBy);
    setPage(1); // 정렬 변경 시 첫 페이지로 이동
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    // 페이지 변경 시 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  async function handleEditSuccess() {
    setEditingId(null);
    // 리뷰 목록 새로고침
    await loadReviews();
    // 페이지 새로고침으로 평점 업데이트
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "latest", label: "최신순" },
    { value: "oldest", label: "오래된순" },
    { value: "ratingHigh", label: "평점 높은순" },
    { value: "ratingLow", label: "평점 낮은순" },
  ];

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          리뷰 {pagination ? `(${pagination.totalCount}개)` : `(${reviews.length}개)`}
        </h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">정렬:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          {editingId === review.id ? (
            <EditReviewForm
              hospitalId={hospitalId}
              reviewId={review.id}
              initialData={{
                name: review.name,
                email: review.email,
                rating: review.rating,
                title: review.title,
                content: review.content,
                language: review.language,
              }}
              onCancel={() => setEditingId(null)}
              onSuccess={handleEditSuccess}
            />
          ) : (
            <>
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
                  <div className="mb-2">
                    <StarRating
                      value={review.rating}
                      onChange={() => {}}
                      maxRating={5}
                      allowHalf={true}
                      size="sm"
                      readonly={true}
                      hospitalId={hospitalId}
                    />
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
                    onClick={() => setEditingId(review.id)}
                    disabled={deletingId === review.id || editingId !== null}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    title="리뷰 수정"
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={() => setReportingId(review.id)}
                    disabled={deletingId === review.id || editingId !== null || reportingId !== null}
                    className="text-xs text-orange-600 hover:text-orange-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    title="리뷰 신고"
                  >
                    🚨 신고
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id || editingId !== null || reportingId !== null}
                    className="text-xs text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    title="리뷰 삭제"
                  >
                    {deletingId === review.id ? "삭제 중..." : "🗑️ 삭제"}
                  </button>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
              
              {/* 리뷰 이미지 갤러리 */}
              <ReviewImageGallery reviewId={review.id} />
              
              {/* 좋아요/싫어요 버튼 */}
              <div className="mt-3 flex items-center justify-between">
                <ReviewLikeButton
                  reviewId={review.id}
                  initialLikeCount={review.likeCount || 0}
                  initialDislikeCount={review.dislikeCount || 0}
                />
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>💬 {review.commentCount || 0}개의 댓글</span>
                </div>
              </div>
              
              {/* 리뷰 댓글 섹션 */}
              <ReviewComments reviewId={review.id} />
            </>
          )}
        </div>
      ))}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
      {reportingId && (
        <ReportReviewModal
          reviewId={reportingId}
          hospitalId={hospitalId}
          isOpen={true}
          onClose={() => setReportingId(null)}
          onSuccess={() => {
            setReportingId(null);
          }}
        />
      )}
    </div>
  );
}

