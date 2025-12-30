"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  allowHalf?: boolean;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  hospitalId?: number;
}

export default function StarRating({
  value,
  onChange,
  maxRating = 5,
  allowHalf = true,
  size = "md",
  readonly = false,
  hospitalId,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  // value를 명시적으로 Number로 변환하여 0.5점 값이 제대로 처리되도록 함
  const numericValue = Number(value);
  if (isNaN(numericValue)) {
    console.warn("StarRating: Invalid value received:", value);
  }
  const displayValue = hoverValue !== null ? hoverValue : (isNaN(numericValue) ? 0 : numericValue);

  function handleClick(rating: number) {
    if (!readonly) {
      onChange(rating);
    }
  }

  function handleMouseEnter(rating: number) {
    if (!readonly) {
      setHoverValue(rating);
    }
  }

  function handleMouseLeave() {
    if (!readonly) {
      setHoverValue(null);
    }
  }

  function handleStarClick(e: React.MouseEvent<HTMLButtonElement>, starIndex: number) {
    if (readonly) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftHalf = allowHalf && clickX < rect.width / 2;
    
    // 클릭 시 호버 상태 초기화
    setHoverValue(null);
    
    if (isLeftHalf) {
      handleClick(starIndex - 0.5);
    } else {
      handleClick(starIndex);
    }
  }

  function handleStarMouseMove(e: React.MouseEvent<HTMLButtonElement>, starIndex: number) {
    if (readonly) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const isLeftHalf = allowHalf && mouseX < rect.width / 2;
    
    if (isLeftHalf) {
      handleMouseEnter(starIndex - 0.5);
    } else {
      handleMouseEnter(starIndex);
    }
  }

  function handleContainerMouseLeave() {
    if (!readonly) {
      setHoverValue(null);
    }
  }

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleContainerMouseLeave}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= Math.floor(displayValue);
        const isHalfFilled = allowHalf && displayValue >= starIndex - 0.5 && displayValue < starIndex;
        const isHovered = hoverValue !== null && starIndex <= Math.floor(hoverValue);
        const isHalfHovered = hoverValue !== null && allowHalf && hoverValue >= starIndex - 0.5 && hoverValue < starIndex;

        const starId = `star-${hospitalId || 'default'}-${i}`;
        const showFilled = isFilled || isHovered;
        const showHalf = isHalfFilled || isHalfHovered;
        
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => handleStarClick(e, starIndex)}
            onMouseMove={(e) => handleStarMouseMove(e, starIndex)}
            disabled={readonly}
            className={`${sizeClasses[size]} transition-all duration-150 ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
            } ${showFilled || showHalf ? "text-yellow-400" : "text-gray-300"}`}
            aria-label={`${starIndex}점`}
          >
            {showHalf ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id={starId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill={`url(#${starId})`}
                  stroke="currentColor"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill={showFilled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-full h-full"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            )}
          </button>
        );
      })}
      {!readonly && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {displayValue.toFixed(1)}점
        </span>
      )}
    </div>
  );
}
