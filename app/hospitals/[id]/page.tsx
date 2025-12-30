import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import HospitalRequestForm from "./_components/HospitalRequestForm";
import ReviewFormWrapper from "./_components/ReviewFormWrapper";
import FavoriteButton from "./_components/FavoriteButton";
import RecentHospitalTracker from "./_components/RecentHospitalTracker";

export const dynamic = "force-dynamic";

export default async function HospitalDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const hospitalId = Number(id);

  if (Number.isNaN(hospitalId)) notFound();

  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    include: {
      departments: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!hospital) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-burgundy-50 via-rose-50 to-pink-50">
      {/* 최근 본 병원 추적 */}
      <RecentHospitalTracker hospital={hospital} />
      
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-rose-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-burgundy-700 hover:text-burgundy-900 inline-flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 병원 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 병원 이미지 */}
            {hospital.imageUrl && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={hospital.imageUrl}
                  alt={hospital.name}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
            )}

            {/* 병원 기본 정보 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {hospital.name}
                  </h1>
                  {hospital.nameEn && (
                    <p className="text-lg text-gray-600">{hospital.nameEn}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <FavoriteButton hospitalId={hospital.id} />
                  {hospital.rating !== null && hospital.rating > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <div className="text-xl font-bold text-gray-900">
                          {hospital.rating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">
                          리뷰 {hospital.reviewCount}개
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-start">
                  <span className="text-xl mr-3">📍</span>
                  <div>
                    <p className="font-medium text-gray-900">주소</p>
                    <p className="text-gray-600">
                      {hospital.city && `${hospital.city}, `}
                      {hospital.address}
                    </p>
                  </div>
                </div>

                {hospital.phone && (
                  <div className="flex items-center">
                    <span className="text-xl mr-3">📞</span>
                    <div>
                      <p className="font-medium text-gray-900">전화번호</p>
                      <a
                        href={`tel:${hospital.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {hospital.phone}
                      </a>
                    </div>
                  </div>
                )}

                {hospital.website && (
                  <div className="flex items-center">
                    <span className="text-xl mr-3">🌐</span>
                    <div>
                      <p className="font-medium text-gray-900">웹사이트</p>
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {hospital.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 진료과 정보 */}
            {hospital.departments.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">진료과</h2>
                <div className="flex flex-wrap gap-3">
                  {hospital.departments.map((hd) => (
                    <div
                      key={hd.department.id}
                      className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <span className="text-xl mr-2">
                        {hd.department.icon || "🏥"}
                      </span>
                      <span className="font-medium text-blue-900">
                        {hd.department.name}
                      </span>
                      <span className="text-sm text-blue-700 ml-2">
                        ({hd.department.nameEn})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 병원 설명 */}
            {(hospital.description || hospital.descriptionEn) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">병원 소개</h2>
                {hospital.description && (
                  <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-line">
                      {hospital.description}
                    </p>
                  </div>
                )}
                {hospital.descriptionEn && (
                  <div className="border-t pt-4">
                    <p className="text-gray-700 whitespace-pre-line">
                      {hospital.descriptionEn}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 리뷰 섹션 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ReviewFormWrapper hospitalId={hospital.id} />
            </div>
          </div>

          {/* 오른쪽: 예약 폼 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                진료 문의하기
              </h2>
              <HospitalRequestForm hospitalId={hospital.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
