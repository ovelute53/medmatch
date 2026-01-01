"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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

interface Suggestion {
  id: number;
  text: string;
  subtext?: string;
  type: "hospital";
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const router = useRouter();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 검색 기록 로드
    setHistory(getSearchHistory());

    // 외부 클릭 감지
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowHistory(false);
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 자동완성 검색
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(async () => {
        setLoadingSuggestions(true);
        try {
          const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(value.trim())}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("자동완성 검색 실패:", error);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value]);

  function handleInputChange(newValue: string) {
    onChange(newValue);
    setShowHistory(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      // 엔터 키로 검색 시 기록에 추가
      addSearchHistory(value);
      setHistory(getSearchHistory());
      setShowHistory(false);
      setShowSuggestions(false);
    }
  }

  function handleFocus() {
    if (history.length > 0) {
      setShowHistory(true);
    }
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }

  function handleHistoryClick(query: string) {
    onChange(query);
    addSearchHistory(query);
    setHistory(getSearchHistory());
    setShowHistory(false);
    setShowSuggestions(false);
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    if (suggestion.type === "hospital") {
      router.push(`/hospitals/${suggestion.id}`);
      addSearchHistory(suggestion.text);
      setHistory(getSearchHistory());
      setShowSuggestions(false);
      setShowHistory(false);
    } else {
      onChange(suggestion.text);
      addSearchHistory(suggestion.text);
      setHistory(getSearchHistory());
      setShowSuggestions(false);
      setShowHistory(false);
    }
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
          onFocus={handleFocus}
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

      {/* 자동완성 제안 */}
      {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border-2 border-gray-100 overflow-hidden">
          {loadingSuggestions ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent mx-auto"></div>
              <p className="mt-2 text-sm">검색 중...</p>
            </div>
          ) : (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                검색 제안
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.subtext && (
                        <div className="text-sm text-gray-500 truncate mt-0.5">
                          {suggestion.subtext}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 검색 기록 드롭다운 */}
      {showHistory && history.length > 0 && !showSuggestions && (
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
