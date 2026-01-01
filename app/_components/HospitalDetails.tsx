"use client";

interface HospitalDetailsProps {
  operatingHours?: string | null;
  operatingHoursEn?: string | null;
  hasParking?: boolean;
  parkingInfo?: string | null;
  parkingInfoEn?: string | null;
  isWheelchairAccessible?: boolean;
  supportedLanguages?: string | null;
  transportationInfo?: string | null;
  transportationInfoEn?: string | null;
  estimatedCost?: string | null;
  estimatedCostEn?: string | null;
}

export default function HospitalDetails({
  operatingHours,
  operatingHoursEn,
  hasParking,
  parkingInfo,
  parkingInfoEn,
  isWheelchairAccessible,
  supportedLanguages,
  transportationInfo,
  transportationInfoEn,
  estimatedCost,
  estimatedCostEn,
}: HospitalDetailsProps) {
  const hasDetails =
    operatingHours ||
    hasParking ||
    parkingInfo ||
    isWheelchairAccessible ||
    supportedLanguages ||
    transportationInfo ||
    estimatedCost;

  if (!hasDetails) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">병원 정보</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 운영 시간 */}
        {(operatingHours || operatingHoursEn) && (
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">🕐</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">운영 시간</h3>
              {operatingHours && (
                <p className="text-gray-700 mb-1">{operatingHours}</p>
              )}
              {operatingHoursEn && (
                <p className="text-sm text-gray-500">{operatingHoursEn}</p>
              )}
            </div>
          </div>
        )}

        {/* 주차 정보 */}
        {(hasParking || parkingInfo || parkingInfoEn) && (
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">🚗</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">주차</h3>
              {hasParking ? (
                <>
                  <p className="text-gray-700 mb-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-green-50 text-green-700 text-sm font-medium mr-2">
                      ✓ 주차 가능
                    </span>
                  </p>
                  {parkingInfo && (
                    <p className="text-gray-700 mb-1">{parkingInfo}</p>
                  )}
                  {parkingInfoEn && (
                    <p className="text-sm text-gray-500">{parkingInfoEn}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm">주차 정보 없음</p>
              )}
            </div>
          </div>
        )}

        {/* 휠체어 접근 */}
        {isWheelchairAccessible !== undefined && (
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">♿</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">접근성</h3>
              {isWheelchairAccessible ? (
                <p className="text-gray-700">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                    ✓ 휠체어 접근 가능
                  </span>
                </p>
              ) : (
                <p className="text-gray-500 text-sm">휠체어 접근 정보 없음</p>
              )}
            </div>
          </div>
        )}

        {/* 지원 언어 */}
        {supportedLanguages && (
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">🌐</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">지원 언어</h3>
              <div className="flex flex-wrap gap-2">
                {supportedLanguages.split(",").map((lang, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200"
                  >
                    {lang.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 교통편 안내 */}
        {(transportationInfo || transportationInfoEn) && (
          <div className="flex items-start md:col-span-2">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">🚇</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">교통편 안내</h3>
              {transportationInfo && (
                <p className="text-gray-700 mb-1">{transportationInfo}</p>
              )}
              {transportationInfoEn && (
                <p className="text-sm text-gray-500">{transportationInfoEn}</p>
              )}
            </div>
          </div>
        )}

        {/* 예상 진료비 */}
        {(estimatedCost || estimatedCostEn) && (
          <div className="flex items-start md:col-span-2">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">💰</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">예상 진료비</h3>
              {estimatedCost && (
                <p className="text-gray-700 mb-1">{estimatedCost}</p>
              )}
              {estimatedCostEn && (
                <p className="text-sm text-gray-500">{estimatedCostEn}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

