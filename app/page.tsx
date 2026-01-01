"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "./_components/LoadingSpinner";
import ErrorMessage from "./_components/ErrorMessage";
import EmptyState from "./_components/EmptyState";
import HighlightText from "./_components/HighlightText";
import UserMenu from "./_components/UserMenu";
import RecentHospitals from "./_components/RecentHospitals";
import SearchInput from "./_components/SearchInput";
import CompareButton from "./_components/CompareButton";
import Pagination from "./_components/Pagination";
import SortSelector from "./_components/SortSelector";
import AdvancedFilters from "./_components/AdvancedFilters";
import FilterPresets from "./_components/FilterPresets";

interface Department {
  id: number;
  name: string;
  nameEn: string;
  icon: string | null;
}

interface HospitalDepartment {
  department: Department;
}

interface Hospital {
  id: number;
  name: string;
  nameEn: string | null;
  address: string;
  city: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number;
  departments: HospitalDepartment[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function HomePage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [minReviewCount, setMinReviewCount] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
    loadHospitals();
  }, [searchQuery, selectedDepartment, selectedDepartmentIds, selectedCity, sortBy, minRating, maxRating, minReviewCount]);

  useEffect(() => {
    loadHospitals();
  }, [currentPage]);

  async function loadDepartments() {
    try {
      const res = await fetch("/api/departments");
      if (!res.ok) {
        throw new Error("진료과를 불러오는데 실패했습니다.");
      }
      const data = await res.json();
      if (data.departments) {
        setDepartments(data.departments);
      }
    } catch (error: any) {
      console.error("진료과 로드 실패:", error);
      setError(error.message || "데이터를 불러오는데 실패했습니다.");
    }
  }

  async function loadHospitals() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      // 여러 진료과 선택 (우선순위)
      if (selectedDepartmentIds.length > 0) {
        selectedDepartmentIds.forEach(id => params.append("departmentIds", id.toString()));
      } else if (selectedDepartment) {
        params.append("departmentId", selectedDepartment.toString());
      }
      if (selectedCity) params.append("city", selectedCity);
      params.append("page", currentPage.toString());
      params.append("limit", "12");
      
      // 정렬 파라미터 파싱
      const [sortField, sortOrder] = sortBy.split("-");
      params.append("sortBy", sortField);
      params.append("sortOrder", sortOrder);
      
      // 고급 필터 파라미터
      if (minRating > 0) params.append("minRating", minRating.toString());
      if (maxRating < 5) params.append("maxRating", maxRating.toString());
      if (minReviewCount > 0) params.append("minReviewCount", minReviewCount.toString());

      const res = await fetch(`/api/hospitals?${params.toString()}`);
      if (!res.ok) {
        throw new Error("병원을 불러오는데 실패했습니다.");
      }
      const data = await res.json();
      if (data.hospitals) {
        setHospitals(data.hospitals);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("병원 로드 실패:", error);
      setError(error.message || "병원을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleResetFilters() {
    setMinRating(0);
    setMaxRating(5);
    setMinReviewCount(0);
    setSelectedDepartmentIds([]);
    setCurrentPage(1);
  }

  function toggleDepartment(deptId: number) {
    setSelectedDepartmentIds(prev => {
      if (prev.includes(deptId)) {
        return prev.filter(id => id !== deptId);
      } else {
        return [...prev, deptId];
      }
    });
    // 단일 선택도 초기화
    setSelectedDepartment(null);
  }

  function handleApplyPreset(preset: {
    filters: {
      minRating?: number;
      maxRating?: number;
      minReviewCount?: number;
    };
  }) {
    if (preset.filters.minRating !== undefined) {
      setMinRating(preset.filters.minRating);
    }
    if (preset.filters.maxRating !== undefined) {
      setMaxRating(preset.filters.maxRating);
    }
    if (preset.filters.minReviewCount !== undefined) {
      setMinReviewCount(preset.filters.minReviewCount);
    }
    setCurrentPage(1);
    setShowAdvancedFilters(true);
  }

  const cities = Array.from(new Set(hospitals.map((h) => h.city).filter(Boolean))) as string[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white">
      {/* 헤더 */}
      <header className="glass sticky top-0 z-50 border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold gradient-text">MedMatch</h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-0.5">외국인 환자 맞춤 병원 매칭 플랫폼</p>
              </div>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero 섹션 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-transparent to-accent-purple/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative">
          <div className="text-center animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              신뢰할 수 있는
              <span className="block mt-2 gradient-text">병원을 찾아보세요</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              외국인 환자를 위한 최적의 병원 매칭 서비스.<br />
              다양한 언어 지원과 전문 의료진이 여러분을 도와드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-accent-purple rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <a href="#search" className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  병원 찾기 시작하기
                </a>
              </div>
              <a href="#hospitals" className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 shadow-md hover:shadow-lg">
                병원 목록 보기
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="search" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 검색 및 필터 섹션 */}
        <div className="card-modern p-6 sm:p-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-4">
            {/* 검색바 */}
            <div>
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="병원명, 주소로 검색하세요..."
              />
            </div>

            {/* 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 진료과 필터 - 여러 선택 가능 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  진료과 선택 {selectedDepartmentIds.length > 0 && `(${selectedDepartmentIds.length}개 선택됨)`}
                </label>
                <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-xl bg-white min-h-[48px]">
                  {departments.length === 0 ? (
                    <p className="text-sm text-gray-500">진료과 로딩 중...</p>
                  ) : (
                    <>
                      {departments.slice(0, 8).map((dept) => (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => toggleDepartment(dept.id)}
                          className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            selectedDepartmentIds.includes(dept.id)
                              ? "bg-primary-600 text-white border-primary-600 shadow-md"
                              : "bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:bg-primary-50"
                          }`}
                        >
                          <span className="mr-1.5">{dept.icon || "🏥"}</span>
                          {dept.name}
                        </button>
                      ))}
                      {departments.length > 8 && (
                        <button
                          type="button"
                          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                          className="px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm font-medium"
                        >
                          더보기...
                        </button>
                      )}
                    </>
                  )}
                </div>
                {/* 선택된 진료과 표시 */}
                {selectedDepartmentIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedDepartmentIds.map(id => {
                      const dept = departments.find(d => d.id === id);
                      if (!dept) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium"
                        >
                          {dept.icon} {dept.name}
                          <button
                            onClick={() => toggleDepartment(id)}
                            className="ml-1.5 hover:text-primary-900"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 도시 필터 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  도시 선택
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-gray-900 font-medium"
                >
                  <option value="">전체 도시</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 고급 필터 */}
            <div className="mt-4">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                상세 필터
                {(minRating > 0 || maxRating < 5 || minReviewCount > 0 || selectedDepartmentIds.length > 0) && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                    활성
                  </span>
                )}
              </button>
              
              {showAdvancedFilters && (
                <div className="mt-4">
                  <AdvancedFilters
                    minRating={minRating}
                    maxRating={maxRating}
                    minReviewCount={minReviewCount}
                    onMinRatingChange={setMinRating}
                    onMaxRatingChange={setMaxRating}
                    onMinReviewCountChange={setMinReviewCount}
                    onReset={handleResetFilters}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 필터 프리셋 */}
        <div className="mb-6">
          <FilterPresets onApplyPreset={handleApplyPreset} />
        </div>

        {/* 진료과 빠른 선택 */}
        {departments.length > 0 && (
          <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">인기 진료과</h2>
              {(selectedDepartment || selectedDepartmentIds.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedDepartment(null);
                    setSelectedDepartmentIds([]);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  전체보기
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {departments.slice(0, 8).map((dept, index) => (
                <button
                  key={dept.id}
                  onClick={() => toggleDepartment(dept.id)}
                  className={`px-5 py-3 rounded-full border-2 transition-all duration-300 font-semibold text-sm sm:text-base relative overflow-hidden group ${
                    selectedDepartmentIds.includes(dept.id) || selectedDepartment === dept.id
                      ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white border-primary-600 shadow-lg shadow-primary-200/50 scale-105"
                      : "bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-50/50 hover:text-primary-700 hover:shadow-md"
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="relative z-10 flex items-center">
                    <span className="mr-2 text-lg">{dept.icon || "🏥"}</span>
                    {dept.name}
                  </span>
                  {selectedDepartment === dept.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-transparent animate-shimmer"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 최근 본 병원 */}
        <RecentHospitals />

        {/* 병원 목록 */}
        <div id="hospitals" className="scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                병원 목록
                {pagination && (
                  <span className="text-primary-600"> ({pagination.totalCount.toLocaleString()}개)</span>
                )}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {pagination && pagination.totalCount > 0 ? (
                  <>
                    전체 {pagination.totalCount.toLocaleString()}개 중{" "}
                    {((currentPage - 1) * 12 + 1).toLocaleString()}-
                    {Math.min(currentPage * 12, pagination.totalCount).toLocaleString()}개 표시
                  </>
                ) : (
                  "검색 조건에 맞는 병원을 확인해보세요"
                )}
              </p>
            </div>
            <SortSelector value={sortBy} onChange={setSortBy} />
          </div>

          {loading ? (
            <LoadingSpinner size="lg" text="병원 목록을 불러오는 중..." />
          ) : error ? (
            <ErrorMessage
              message={error}
              onRetry={() => {
                loadHospitals();
              }}
            />
          ) : hospitals.length === 0 ? (
            <EmptyState
              icon="🏥"
              title="등록된 병원이 없습니다"
              description="첫 번째 병원을 등록해보세요"
              action={{
                label: "병원 등록하기",
                href: "/admin/hospitals/new",
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {hospitals.map((hospital, index) => (
                <div
                  key={hospital.id}
                  className="card-modern overflow-hidden group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link href={`/hospitals/${hospital.id}`} className="block relative">
                    {hospital.imageUrl ? (
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                        <img
                          src={hospital.imageUrl}
                          alt={hospital.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <span className="text-6xl">🏥</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Link href={`/hospitals/${hospital.id}`} className="flex-1 group">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors cursor-pointer line-clamp-1">
                          {hospital.name}
                        </h3>
                      </Link>
                      {hospital.rating !== null && hospital.rating > 0 && (
                        <div className="flex items-center bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-200 ml-2">
                          <span className="text-base">⭐</span>
                          <span className="text-sm font-bold text-yellow-700 ml-1">
                            {hospital.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    {hospital.nameEn && (
                      <p className="text-sm text-gray-500 mb-2.5 font-medium">
                        <HighlightText text={hospital.nameEn} searchQuery={searchQuery} />
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-3 flex items-start">
                      <span className="mr-1.5 mt-0.5 flex-shrink-0">📍</span>
                      <span className="line-clamp-2">
                        {hospital.city && (
                          <>
                            <HighlightText text={hospital.city} searchQuery={searchQuery} />,{" "}
                          </>
                        )}
                        <HighlightText text={hospital.address} searchQuery={searchQuery} />
                      </span>
                    </p>
                    {hospital.departments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hospital.departments.slice(0, 3).map((hd) => (
                          <span
                            key={hd.department.id}
                            className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full border border-primary-200"
                          >
                            {hd.department.icon} {hd.department.name}
                          </span>
                        ))}
                        {hospital.departments.length > 3 && (
                          <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-full border border-gray-200">
                            +{hospital.departments.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {hospital.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        <HighlightText text={hospital.description} searchQuery={searchQuery} />
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      {hospital.reviewCount > 0 && (
                        <p className="text-xs text-gray-500 font-medium">
                          리뷰 {hospital.reviewCount}개
                        </p>
                      )}
                      <div onClick={(e) => e.stopPropagation()}>
                        <CompareButton hospital={hospital} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
