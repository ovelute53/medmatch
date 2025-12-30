"use client";

import { useEffect, useState } from "react";
import {
  addToComparison,
  removeFromComparison,
  isInComparison,
  canAddToComparison,
} from "@/lib/hospital-comparison";

interface CompareButtonProps {
  hospital: {
    id: number;
    name: string;
    nameEn?: string | null;
    city?: string | null;
    rating?: number | null;
  };
}

export default function CompareButton({ hospital }: CompareButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [canAdd, setCanAdd] = useState(true);

  useEffect(() => {
    checkStatus();

    // 커스텀 이벤트 리스너
    const handleComparisonChange = () => {
      checkStatus();
    };

    window.addEventListener("comparison-changed", handleComparisonChange);

    return () => {
      window.removeEventListener("comparison-changed", handleComparisonChange);
    };
  }, [hospital.id]);

  function checkStatus() {
    setIsAdded(isInComparison(hospital.id));
    setCanAdd(canAddToComparison());
  }

  function handleToggle() {
    if (isAdded) {
      removeFromComparison(hospital.id);
    } else {
      const success = addToComparison({
        id: hospital.id,
        name: hospital.name,
        nameEn: hospital.nameEn || undefined,
        city: hospital.city || undefined,
        rating: hospital.rating || undefined,
      });

      if (!success) {
        alert("최대 4개까지 비교할 수 있습니다.");
        return;
      }
    }

    checkStatus();
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event("comparison-changed"));
  }

  return (
    <button
      onClick={handleToggle}
      disabled={!isAdded && !canAdd}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${
          isAdded
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isAdded ? "비교 제거" : "비교하기"}
    </button>
  );
}

