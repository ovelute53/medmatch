import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import HospitalRequestForm from "./_components/HospitalRequestForm";
import ReviewFormWrapper from "./_components/ReviewFormWrapper";
import FavoriteButton from "./_components/FavoriteButton";
import RecentHospitalTracker from "./_components/RecentHospitalTracker";
import HospitalDetails from "../../_components/HospitalDetails";
import HospitalImage from "../../_components/HospitalImage";

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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white">
      {/* 최근 본 병원 추적 */}
      <RecentHospitalTracker hospital={hospital} />
      
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 inline-flex items-center font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 병원 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 병원 이미지 */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <HospitalImage
                imageUrl={hospital.imageUrl}
                name={hospital.name}
              />
            </div>

            {/* 병원 기본 정보 */}
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    {hospital.name}
                  </h1>
                  {hospital.nameEn && (
                    <p className="text-lg text-gray-600 font-medium">{hospital.nameEn}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <FavoriteButton hospitalId={hospital.id} />
                  {hospital.rating !== null && hospital.rating > 0 && (
                    <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <div className="text-xl font-bold text-yellow-700">
                          {hospital.rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          리뷰 {hospital.reviewCount}개
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
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
                      <p className="font-semibold text-gray-900 mb-1">전화번호</p>
                      <a
                        href={`tel:${hospital.phone}`}
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
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
                      <p className="font-semibold text-gray-900 mb-1">웹사이트</p>
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors break-all"
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
              <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">진료과</h2>
                <div className="flex flex-wrap gap-3">
                  {hospital.departments.map((hd) => (
                    <div
                      key={hd.department.id}
                      className="px-4 py-2.5 bg-primary-50 rounded-xl border-2 border-primary-200 hover:border-primary-300 transition-colors"
                    >
                      <span className="text-xl mr-2">
                        {hd.department.icon || "🏥"}
                      </span>
                      <span className="font-semibold text-primary-900">
                        {hd.department.name}
                      </span>
                      <span className="text-sm text-primary-700 ml-2 font-medium">
                        ({hd.department.nameEn})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 병원 상세 정보 */}
            <HospitalDetails
              operatingHours={hospital.operatingHours}
              operatingHoursEn={hospital.operatingHoursEn}
              hasParking={hospital.hasParking}
              parkingInfo={hospital.parkingInfo}
              parkingInfoEn={hospital.parkingInfoEn}
              isWheelchairAccessible={hospital.isWheelchairAccessible}
              supportedLanguages={hospital.supportedLanguages}
              transportationInfo={hospital.transportationInfo}
              transportationInfoEn={hospital.transportationInfoEn}
              estimatedCost={hospital.estimatedCost}
              estimatedCostEn={hospital.estimatedCostEn}
            />

            {/* 병원 상세 정보 */}
            <HospitalDetails
              operatingHours={hospital.operatingHours}
              operatingHoursEn={hospital.operatingHoursEn}
              hasParking={hospital.hasParking}
              parkingInfo={hospital.parkingInfo}
              parkingInfoEn={hospital.parkingInfoEn}
              isWheelchairAccessible={hospital.isWheelchairAccessible}
              supportedLanguages={hospital.supportedLanguages}
              transportationInfo={hospital.transportationInfo}
              transportationInfoEn={hospital.transportationInfoEn}
              estimatedCost={hospital.estimatedCost}
              estimatedCostEn={hospital.estimatedCostEn}
            />

            {/* 병원 설명 */}
            {(hospital.description || hospital.descriptionEn) && (
              <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">병원 소개</h2>
                {hospital.description && (
                  <div className="mb-6">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {hospital.description}
                    </p>
                  </div>
                )}
                {hospital.descriptionEn && (
                  <div className="border-t border-gray-100 pt-6">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {hospital.descriptionEn}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 리뷰 섹션 */}
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
              <ReviewFormWrapper hospitalId={hospital.id} />
            </div>
          </div>

          {/* 오른쪽: 예약 폼 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 sticky top-4 border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
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
