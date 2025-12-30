"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getComparisonHospitals,
  clearComparison,
  type ComparisonHospital,
} from "@/lib/hospital-comparison";
import LoadingSpinner from "../_components/LoadingSpinner";

interface HospitalDetails {
  id: number;
  name: string;
  nameEn: string | null;
  address: string;
  city: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  rating: number | null;
  reviewCount: number;
  departments: Array<{
    department: {
      id: number;
      name: string;
      icon: string | null;
    };
  }>;
}

export default function ComparePage() {
  const router = useRouter();
  const [comparisonList, setComparisonList] = useState<ComparisonHospital[]>([]);
  const [hospitalsData, setHospitalsData] = useState<HospitalDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = getComparisonHospitals();
    setComparisonList(list);

    if (list.length < 2) {
      // 비교할 병원이 2개 미만이면 메인 페이지로 이동
      router.push("/");
      return;
    }

    loadHospitalsData(list.map((h) => h.id));
  }, [router]);

  async function loadHospitalsData(ids: number[]) {
    setLoading(true);
    try {
      const promises = ids.map((id) => fetch(`/api/hospitals/${id}`).then((res) => res.json()));
      const results = await Promise.all(promises);
      setHospitalsData(results.map((r) => r.hospital).filter(Boolean));
    } catch (error) {
      console.error("병원 정보 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleClearAll() {
    clearComparison();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="병원 정보 불러오는 중..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
              ← 목록으로 돌아가기
            </Link>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-800"
            >
              비교 목록 전체 삭제
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">📊</span>
          병원 비교 ({hospitalsData.length}개)
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-4 text-left bg-gray-50 font-semibold text-gray-700 w-48">
                  항목
                </th>
                {hospitalsData.map((hospital) => (
                  <th key={hospital.id} className="p-4 text-left min-w-[250px]">
                    <Link
                      href={`/hospitals/${hospital.id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
                    >
                      {hospital.name}
                    </Link>
                    {hospital.nameEn && (
                      <p className="text-sm text-gray-600 font-normal mt-1">{hospital.nameEn}</p>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 평점 */}
              <tr className="border-b border-gray-100">
                <td className="p-4 bg-gray-50 font-medium text-gray-700">평점</td>
                {hospitalsData.map((hospital) => (
                  <td key={hospital.id} className="p-4">
                    {hospital.rating && hospital.rating > 0 ? (
                      <div>
                        <div className="text-yellow-500 font-semibold">
                          ⭐ {hospital.rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">리뷰 {hospital.reviewCount}개</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">평점 없음</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 주소 */}
              <tr className="border-b border-gray-100">
                <td className="p-4 bg-gray-50 font-medium text-gray-700">주소</td>
                {hospitalsData.map((hospital) => (
                  <td key={hospital.id} className="p-4">
                    <div>
                      {hospital.city && <div className="text-sm text-gray-600">{hospital.city}</div>}
                      <div className="text-sm text-gray-900">{hospital.address}</div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* 전화번호 */}
              <tr className="border-b border-gray-100">
                <td className="p-4 bg-gray-50 font-medium text-gray-700">전화번호</td>
                {hospitalsData.map((hospital) => (
                  <td key={hospital.id} className="p-4">
                    {hospital.phone ? (
                      <a
                        href={`tel:${hospital.phone}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {hospital.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">정보 없음</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 웹사이트 */}
              <tr className="border-b border-gray-100">
                <td className="p-4 bg-gray-50 font-medium text-gray-700">웹사이트</td>
                {hospitalsData.map((hospital) => (
                  <td key={hospital.id} className="p-4">
                    {hospital.website ? (
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        방문하기 →
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">정보 없음</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 진료과 */}
              <tr className="border-b border-gray-100">
                <td className="p-4 bg-gray-50 font-medium text-gray-700">진료과</td>
                {hospitalsData.map((hospital) => (
                  <td key={hospital.id} className="p-4">
                    {hospital.departments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {hospital.departments.map((dept) => (
                          <span
                            key={dept.department.id}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                          >
                            {dept.department.icon} {dept.department.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">정보 없음</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 설명 */}
              <tr>
                <td className="p-4 bg-gray-50 font-medium text-gray-700">설명</td>
                {hospitalsData.map((hospital) => (
                  <td key={hospital.id} className="p-4">
                    {hospital.description ? (
                      <p className="text-sm text-gray-700">{hospital.description}</p>
                    ) : (
                      <span className="text-gray-400 text-sm">정보 없음</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            병원 더 보기
          </Link>
        </div>
      </div>
    </main>
  );
}

