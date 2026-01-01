"use client";

interface AdvancedFiltersProps {
  minRating: number;
  maxRating: number;
  minReviewCount: number;
  onMinRatingChange: (value: number) => void;
  onMaxRatingChange: (value: number) => void;
  onMinReviewCountChange: (value: number) => void;
  onReset: () => void;
}

export default function AdvancedFilters({
  minRating,
  maxRating,
  minReviewCount,
  onMinRatingChange,
  onMaxRatingChange,
  onMinReviewCountChange,
  onReset,
}: AdvancedFiltersProps) {
  const hasActiveFilters = minRating > 0 || maxRating < 5 || minReviewCount > 0;

  return (
    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">상세 필터</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* 평점 범위 필터 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            평점 범위
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">최소 평점</span>
                  <span className="text-sm font-semibold text-primary-600">
                    {minRating.toFixed(1)}⭐
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxRating}
                  step="0.5"
                  value={minRating}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value <= maxRating) {
                      onMinRatingChange(value);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  style={{
                    background: `linear-gradient(to right, rgb(61, 94, 255) 0%, rgb(61, 94, 255) ${(minRating / 5) * 100}%, rgb(229, 231, 235) ${(minRating / 5) * 100}%, rgb(229, 231, 235) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>5</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">최대 평점</span>
                  <span className="text-sm font-semibold text-primary-600">
                    {maxRating.toFixed(1)}⭐
                  </span>
                </div>
                <input
                  type="range"
                  min={minRating}
                  max="5"
                  step="0.5"
                  value={maxRating}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value >= minRating) {
                      onMaxRatingChange(value);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  style={{
                    background: `linear-gradient(to right, rgb(229, 231, 235) 0%, rgb(229, 231, 235) ${(maxRating / 5) * 100}%, rgb(61, 94, 255) ${(maxRating / 5) * 100}%, rgb(61, 94, 255) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>5</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <span>평점 범위:</span>
              <span className="font-semibold text-gray-900">
                {minRating.toFixed(1)} - {maxRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* 최소 리뷰 수 필터 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            최소 리뷰 수
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={minReviewCount}
              onChange={(e) => onMinReviewCountChange(parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-gray-900 font-medium"
              placeholder="0"
            />
            <span className="text-sm text-gray-600">개 이상</span>
            {minReviewCount > 0 && (
              <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                {minReviewCount}개 이상
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

