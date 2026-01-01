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
        px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
        ${
          isAdded
            ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-200"
            : "bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50"
        }
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:hover:bg-white
      `}
    >
      {isAdded ? "비교 제거" : "비교하기"}
    </button>
  );
}

