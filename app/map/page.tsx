"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GoogleMapView from "../_components/GoogleMapView";

interface Hospital {
  id: number;
  name: string;
  nameEn: string | null;
  address: string;
  city: string | null;
  rating: number | null;
  reviewCount: number;
  imageUrl: string | null;
}

export default function MapPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"ko" | "en">("ko");

  useEffect(() => {
    loadHospitals();
  }, []);

  async function loadHospitals() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hospitals?limit=100");
      if (res.ok) {
        const data = await res.json();
        setHospitals(data.hospitals || []);
      } else {
        setError("병원 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("병원 로드 실패:", error);
      setError("병원 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center font-semibold transition-colors"
              >
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                {language === "ko" ? "홈으로" : "Home"}
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {language === "ko" ? "지도로 병원 찾기" : "Find Hospitals on Map"}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {language === "ko" 
                  ? "지도에서 병원 위치를 확인하고 상세 정보를 확인하세요" 
                  : "Check hospital locations on the map and view details"}
              </p>
            </div>
            <button
              onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors font-medium text-sm"
            >
              {language === "ko" ? "English" : "한국어"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {language === "ko" ? "로딩 중..." : "Loading..."}
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{error}</h3>
            <button
              onClick={loadHospitals}
              className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {language === "ko" ? "다시 시도" : "Retry"}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === "ko" ? "표시된 병원 수" : "Hospitals on Map"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{hospitals.length}</p>
                </div>
                <Link
                  href="/"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {language === "ko" ? "목록으로 보기" : "View List"}
                </Link>
              </div>
            </div>

            <GoogleMapView 
              hospitals={hospitals} 
              language={language}
            />

            {hospitals.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {language === "ko" ? "병원 목록" : "Hospital List"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hospitals.slice(0, 6).map((hospital) => (
                    <Link
                      key={hospital.id}
                      href={`/hospitals/${hospital.id}`}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all"
                    >
                      <h3 className="font-bold text-gray-900 mb-1">
                        {language === "ko" ? hospital.name : (hospital.nameEn || hospital.name)}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{hospital.address}</p>
                      {hospital.rating !== null && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{hospital.rating.toFixed(1)}</span>
                          <span className="text-gray-500">({hospital.reviewCount})</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                {hospitals.length > 6 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {language === "ko" 
                        ? `전체 ${hospitals.length}개 병원 보기 →` 
                        : `View all ${hospitals.length} hospitals →`}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

