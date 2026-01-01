"use client";

interface FilterPreset {
  id: string;
  label: string;
  icon: string;
  filters: {
    minRating?: number;
    maxRating?: number;
    minReviewCount?: number;
  };
}

interface FilterPresetsProps {
  onApplyPreset: (preset: FilterPreset) => void;
}

const presets: FilterPreset[] = [
  {
    id: "high-rating",
    label: "높은 평점",
    icon: "⭐",
    filters: {
      minRating: 4.5,
      maxRating: 5,
      minReviewCount: 50,
    },
  },
  {
    id: "popular",
    label: "인기 병원",
    icon: "🔥",
    filters: {
      minRating: 4.0,
      minReviewCount: 100,
    },
  },
  {
    id: "new",
    label: "신규 병원",
    icon: "🆕",
    filters: {
      minReviewCount: 0,
    },
  },
  {
    id: "verified",
    label: "검증된 병원",
    icon: "✅",
    filters: {
      minRating: 4.0,
      minReviewCount: 50,
    },
  },
];

export default function FilterPresets({ onApplyPreset }: FilterPresetsProps) {
  return (
    <div className="mb-4">
      <p className="text-sm font-semibold text-gray-700 mb-2">빠른 필터</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onApplyPreset(preset)}
            className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-sm font-medium text-gray-700 flex items-center gap-1.5"
          >
            <span>{preset.icon}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

