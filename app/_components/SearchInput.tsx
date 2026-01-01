"use client";

import { useState, useEffect, useRef } from "react";
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
  type SearchHistoryItem,
} from "@/lib/search-history";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 검색 기록 로드
    setHistory(getSearchHistory());

    // 외부 클릭 감지
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(newValue: string) {
    onChange(newValue);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      // 엔터 키로 검색 시 기록에 추가
      addSearchHistory(value);
      setHistory(getSearchHistory());
      setShowHistory(false);
    }
  }

  function handleHistoryClick(query: string) {
    onChange(query);
    addSearchHistory(query);
    setHistory(getSearchHistory());
    setShowHistory(false);
  }

  function handleRemoveHistory(query: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeSearchHistory(query);
    setHistory(getSearchHistory());
  }

  function handleClearAll() {
    clearSearchHistory();
    setHistory([]);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder || "병원명, 주소로 검색하세요..."}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => history.length > 0 && setShowHistory(true)}
          className="w-full px-4 sm:px-5 py-3.5 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm hover:border-gray-300"
        />
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* 검색 기록 드롭다운 */}
      {showHistory && history.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">최근 검색</span>
            <button
              onClick={handleClearAll}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              전체 삭제
            </button>
          </div>
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleHistoryClick(item.query)}
                  className="w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center flex-1">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-900">{item.query}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemoveHistory(item.query, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
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
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

