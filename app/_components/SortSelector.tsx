"use client";

interface SortSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { value: "rating-desc", label: "평점 높은 순", icon: "⭐" },
  { value: "rating-asc", label: "평점 낮은 순", icon: "⭐" },
  { value: "reviewCount-desc", label: "리뷰 많은 순", icon: "💬" },
  { value: "reviewCount-asc", label: "리뷰 적은 순", icon: "💬" },
  { value: "name-asc", label: "이름 가나다 순", icon: "🔤" },
  { value: "name-desc", label: "이름 역순", icon: "🔤" },
  { value: "createdAt-desc", label: "최신 등록 순", icon: "🆕" },
  { value: "createdAt-asc", label: "오래된 순", icon: "🆕" },
];

export default function SortSelector({ value, onChange }: SortSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
        정렬:
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-gray-900 font-medium text-sm cursor-pointer hover:border-gray-300"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

