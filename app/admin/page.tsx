import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let hospitals: any[] = [];
  let departments: any[] = [];

  try {
    [hospitals, departments] = await Promise.all([
      prisma.hospital.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          departments: {
            include: {
              department: true,
            },
          },
        },
      }),
      prisma.department.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);
  } catch (error) {
    console.error("데이터 로드 오류:", error);
    // 에러 발생 시 빈 배열 사용
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-burgundy-50 via-rose-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/"
            className="text-burgundy-700 hover:text-burgundy-900 inline-flex items-center font-medium mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-burgundy-700 to-burgundy-900 bg-clip-text text-transparent mb-2">
            관리자 대시보드
          </h1>
          <p className="text-gray-600">병원 및 진료과를 관리합니다.</p>
        </div>

        <div className="mb-6">
          <Link
            href="/admin/reports"
            className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            리뷰 신고 관리
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/admin/hospitals/new"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  병원 등록
                </h2>
                <p className="text-gray-600">새로운 병원을 등록합니다.</p>
              </div>
              <span className="text-4xl">🏥</span>
            </div>
          </Link>

          <Link
            href="/admin/departments/new"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  진료과 등록
                </h2>
                <p className="text-gray-600">새로운 진료과를 등록합니다.</p>
              </div>
              <span className="text-4xl">💊</span>
            </div>
          </Link>

          <Link
            href="/admin/faq"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  FAQ 관리
                </h2>
                <p className="text-gray-600">자주 묻는 질문을 관리합니다.</p>
              </div>
              <span className="text-4xl">❓</span>
            </div>
          </Link>

          <Link
            href="/admin/articles"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  건강 정보 관리
                </h2>
                <p className="text-gray-600">건강 정보 게시글을 관리합니다.</p>
              </div>
              <span className="text-4xl">📄</span>
            </div>
          </Link>

          <Link
            href="/admin/requests"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  문의 내역
                </h2>
                <p className="text-gray-600">병원 문의 및 예약 요청을 확인합니다.</p>
              </div>
              <span className="text-4xl">📋</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 병원 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">최근 등록된 병원</h2>
              <Link
                href="/hospitals"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                전체 보기 →
              </Link>
            </div>
            {hospitals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">등록된 병원이 없습니다.</p>
                <Link
                  href="/admin/hospitals/new"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  병원 등록하기 →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {hospitals.map((hospital) => (
                  <li
                    key={hospital.id}
                    className="border-b border-gray-200 pb-3 last:border-0"
                  >
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/hospitals/${hospital.id}`}
                        className="flex-1 hover:text-blue-600"
                      >
                        <div className="font-medium text-gray-900">{hospital.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {hospital.city && `${hospital.city}, `}
                          {hospital.address}
                        </div>
                        {hospital.departments.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {hospital.departments.slice(0, 3).map((hd: { department: { id: number; icon: string | null; name: string } }) => (
                              <span
                                key={hd.department.id}
                                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                              >
                                {hd.department.icon} {hd.department.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                      <Link
                        href={`/admin/hospitals/${hospital.id}/edit`}
                        className="ml-4 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                      >
                        수정
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 최근 진료과 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">최근 등록된 진료과</h2>
            </div>
            {departments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">등록된 진료과가 없습니다.</p>
                <Link
                  href="/admin/departments/new"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  진료과 등록하기 →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {departments.map((dept) => (
                  <li
                    key={dept.id}
                    className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-2xl">{dept.icon || "🏥"}</span>
                      <div>
                        <div className="font-medium text-gray-900">{dept.name}</div>
                        <div className="text-sm text-gray-600">{dept.nameEn}</div>
                      </div>
                    </div>
                    <Link
                      href={`/admin/departments/${dept.id}/edit`}
                      className="ml-4 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      수정
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
