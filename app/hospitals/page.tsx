import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EmptyState from "../_components/EmptyState";

export const dynamic = "force-dynamic";

export default async function HospitalsPage() {
  const hospitals = await prisma.hospital.findMany({
    include: {
      departments: {
        include: {
          department: true,
        },
      },
    },
    orderBy: [
      { rating: "desc" },
      { reviewCount: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center font-semibold transition-colors">
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                홈으로
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">병원 목록</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">전체 <span className="font-semibold text-primary-600">{hospitals.length}개</span>의 병원</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {hospitals.length === 0 ? (
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
            {hospitals.map((hospital) => (
              <Link
                key={hospital.id}
                href={`/hospitals/${hospital.id}`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-primary-200 hover:-translate-y-1"
              >
                {hospital.imageUrl && (
                  <div className="h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                    <img
                      src={hospital.imageUrl}
                      alt={hospital.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 flex-1">
                      {hospital.name}
                    </h3>
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
                    <p className="text-sm text-gray-500 mb-2.5 font-medium">{hospital.nameEn}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-3 flex items-start">
                    <span className="mr-1.5 mt-0.5 flex-shrink-0">📍</span>
                    <span className="line-clamp-2">
                      {hospital.city && `${hospital.city}, `}
                      {hospital.address}
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
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                      {hospital.description}
                    </p>
                  )}
                  {hospital.reviewCount > 0 && (
                    <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100 font-medium">
                      리뷰 {hospital.reviewCount}개
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
