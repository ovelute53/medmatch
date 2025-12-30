"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getComparisonHospitals,
  removeFromComparison,
  clearComparison,
  type ComparisonHospital,
} from "@/lib/hospital-comparison";

export default function ComparisonBar() {
  const [hospitals, setHospitals] = useState<ComparisonHospital[]>([]);

  useEffect(() => {
    // 초기 로드
    loadComparisons();

    // storage 이벤트 리스너 (다른 탭에서 변경 감지)
    const handleStorageChange = () => {
      loadComparisons();
    };

    window.addEventListener("storage", handleStorageChange);

    // 커스텀 이벤트 리스너 (같은 탭 내 변경 감지)
    const handleComparisonChange = () => {
      loadComparisons();
    };

    window.addEventListener("comparison-changed", handleComparisonChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("comparison-changed", handleComparisonChange);
    };
  }, []);

  function loadComparisons() {
    setHospitals(getComparisonHospitals());
  }

  function handleRemove(id: number) {
    removeFromComparison(id);
    loadComparisons();
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event("comparison-changed"));
  }

  function handleClearAll() {
    clearComparison();
    loadComparisons();
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event("comparison-changed"));
  }

  if (hospitals.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📊</span>
              <span className="font-semibold text-gray-900">
                병원 비교 ({hospitals.length}/4)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full"
                >
                  <span className="text-sm text-gray-900 truncate max-w-32">
                    {hospital.name}
                  </span>
                  <button
                    onClick={() => handleRemove(hospital.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              전체 삭제
            </button>
            {hospitals.length >= 2 && (
              <Link
                href="/compare"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                비교하기
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

