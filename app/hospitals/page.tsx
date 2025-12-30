import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← 홈으로
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">병원 목록</h1>
              <p className="text-gray-600 mt-1">전체 {hospitals.length}개의 병원</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {hospitals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">등록된 병원이 없습니다.</p>
            <Link
              href="/admin/hospitals/new"
              className="inline-block text-blue-600 hover:text-blue-800"
            >
              첫 번째 병원을 등록해보세요 →
            </Link>
          </div>
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
    </main>
  );
}
