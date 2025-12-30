"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "./_components/LoadingSpinner";
import ErrorMessage from "./_components/ErrorMessage";
import EmptyState from "./_components/EmptyState";

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

export default function HomePage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    loadDepartments();
    loadHospitals();
  }, []);

  useEffect(() => {
    loadHospitals();
  }, [searchQuery, selectedDepartment, selectedCity]);

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
      if (selectedDepartment) params.append("departmentId", selectedDepartment.toString());
      if (selectedCity) params.append("city", selectedCity);

      const res = await fetch(`/api/hospitals?${params.toString()}`);
      if (!res.ok) {
        throw new Error("병원을 불러오는데 실패했습니다.");
      }
      const data = await res.json();
      if (data.hospitals) {
        setHospitals(data.hospitals);
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

  const cities = Array.from(new Set(hospitals.map((h) => h.city).filter(Boolean))) as string[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MedMatch</h1>
              <p className="text-gray-600 mt-1">외국인 환자 맞춤 병원 매칭 플랫폼</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              관리자
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 검색 및 필터 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            {/* 검색바 */}
            <div>
              <input
                type="text"
                placeholder="병원명, 주소로 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 진료과 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  진료과 선택
                </label>
                <select
                  value={selectedDepartment || ""}
                  onChange={(e) =>
                    setSelectedDepartment(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">전체</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.icon} {dept.name} ({dept.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* 도시 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  도시 선택
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">전체</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 진료과 빠른 선택 */}
        {departments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">인기 진료과</h2>
            <div className="flex flex-wrap gap-3">
              {departments.slice(0, 8).map((dept) => (
                <button
                  key={dept.id}
                  onClick={() =>
                    setSelectedDepartment(
                      selectedDepartment === dept.id ? null : dept.id
                    )
                  }
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    selectedDepartment === dept.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                  }`}
                >
                  <span className="mr-2">{dept.icon || "🏥"}</span>
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 병원 목록 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              병원 목록 {hospitals.length > 0 && `(${hospitals.length}개)`}
            </h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitals.map((hospital) => (
                <Link
                  key={hospital.id}
                  href={`/hospitals/${hospital.id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  {hospital.imageUrl && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={hospital.imageUrl}
                        alt={hospital.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {hospital.name}
                      </h3>
                      {hospital.rating !== null && hospital.rating > 0 && (
                        <div className="flex items-center text-yellow-500">
                          <span className="text-sm font-medium">
                            ⭐ {hospital.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    {hospital.nameEn && (
                      <p className="text-sm text-gray-500 mb-2">{hospital.nameEn}</p>
                    )}
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <span className="mr-1">📍</span>
                      {hospital.city && `${hospital.city}, `}
                      {hospital.address}
                    </p>
                    {hospital.departments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {hospital.departments.slice(0, 3).map((hd) => (
                          <span
                            key={hd.department.id}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                          >
                            {hd.department.icon} {hd.department.name}
                          </span>
                        ))}
                        {hospital.departments.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{hospital.departments.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {hospital.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {hospital.description}
                      </p>
                    )}
                    {hospital.reviewCount > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        리뷰 {hospital.reviewCount}개
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
