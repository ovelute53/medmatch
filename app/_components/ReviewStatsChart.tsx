"use client";

import { useState, useEffect } from "react";

interface ReviewStats {
  hospital: {
    id: number;
    name: string;
  };
  stats: {
    totalReviews: number;
    averageRating: number;
    verifiedReviews: number;
    verificationRate: number;
  };
  ratingDistribution: {
    counts: { [key: string]: number };
    percentages: { [key: string]: number };
  };
  monthlyStats: { [key: string]: number };
  recentReviews: Array<{
    id: number;
    name: string;
    rating: number;
    title: string | null;
    content: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    isVerified: boolean;
  }>;
}

interface ReviewStatsChartProps {
  hospitalId: number;
}

export default function ReviewStatsChart({ hospitalId }: ReviewStatsChartProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [hospitalId]);

  async function loadStats() {
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/review-stats`);
      if (!res.ok) {
        throw new Error("통계를 불러오는데 실패했습니다.");
      }
      const data = await res.json();
      setStats(data);
    } catch (error: any) {
      console.error("통계 로드 오류:", error);
      setError(error.message || "통계를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-red-600 text-sm text-center">{error || "통계를 불러올 수 없습니다."}</p>
      </div>
    );
  }

  const ratingKeys = ["5.0", "4.5", "4.0", "3.5", "3.0", "2.5", "2.0", "1.5", "1.0", "0.5"];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">리뷰 통계</h3>

      {/* 전체 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.stats.totalReviews}</div>
          <div className="text-xs text-gray-600 mt-1">전체 리뷰</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.stats.averageRating.toFixed(1)}</div>
          <div className="text-xs text-gray-600 mt-1">평균 평점</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.stats.verifiedReviews}</div>
          <div className="text-xs text-gray-600 mt-1">검증된 리뷰</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.stats.verificationRate}%</div>
          <div className="text-xs text-gray-600 mt-1">검증 비율</div>
        </div>
      </div>

      {/* 평점 분포 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">평점 분포</h4>
        <div className="space-y-2">
          {ratingKeys.map((rating) => {
            const count = stats.ratingDistribution.counts[rating] || 0;
            const percentage = stats.ratingDistribution.percentages[rating] || 0;
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="w-12 text-xs font-medium text-gray-700">
                  ⭐ {rating}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full flex items-center justify-end px-2 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 10 && (
                      <span className="text-xs font-semibold text-gray-800">
                        {percentage}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-12 text-xs text-gray-600 text-right">{count}개</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 월별 리뷰 수 (최근 6개월) */}
      {Object.keys(stats.monthlyStats).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">월별 리뷰 수 (최근 6개월)</h4>
          <div className="flex items-end space-x-2 h-32">
            {Object.entries(stats.monthlyStats)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, count]) => {
                const maxCount = Math.max(...Object.values(stats.monthlyStats));
                const heightPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center h-28">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all duration-500 flex items-start justify-center pt-1"
                        style={{ height: `${heightPercentage}%` }}
                        title={`${month}: ${count}개`}
                      >
                        <span className="text-xs font-semibold text-white">{count}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-center">
                      {month.slice(5)}월
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 최근 리뷰 미리보기 */}
      {stats.recentReviews.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">최근 리뷰</h4>
          <div className="space-y-2">
            {stats.recentReviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-50 rounded-lg p-3 text-xs border border-gray-200"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{review.name}</span>
                    {review.isVerified && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-yellow-500">⭐ {review.rating}</span>
                </div>
                {review.title && (
                  <p className="font-medium text-gray-800 mb-1">{review.title}</p>
                )}
                <p className="text-gray-600 line-clamp-2">{review.content}</p>
                <div className="flex items-center space-x-3 mt-2 text-gray-500">
                  <span>👍 {review.likeCount}</span>
                  <span>💬 {review.commentCount}</span>
                  <span className="ml-auto">
                    {new Date(review.createdAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

