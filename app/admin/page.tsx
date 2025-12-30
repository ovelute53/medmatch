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
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">병원 및 진료과를 관리합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-gray-500">등록된 병원이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {hospitals.map((hospital) => (
                  <li
                    key={hospital.id}
                    className="border-b border-gray-200 pb-3 last:border-0"
                  >
                    <Link
                      href={`/hospitals/${hospital.id}`}
                      className="block hover:text-blue-600"
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
              <p className="text-gray-500">등록된 진료과가 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {departments.map((dept) => (
                  <li
                    key={dept.id}
                    className="flex items-center space-x-3 border-b border-gray-200 pb-3 last:border-0"
                  >
                    <span className="text-2xl">{dept.icon || "🏥"}</span>
                    <div>
                      <div className="font-medium text-gray-900">{dept.name}</div>
                      <div className="text-sm text-gray-600">{dept.nameEn}</div>
                    </div>
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
