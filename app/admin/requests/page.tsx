import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  let requests = [];
  let hospitals = [];

  try {
    [requests, hospitals] = await Promise.all([
      prisma.request.findMany({
        include: {
          hospital: {
            select: {
              id: true,
              name: true,
              nameEn: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.hospital.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("문의 내역 로드 오류:", error);
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    new: "신규",
    contacted: "연락 완료",
    completed: "완료",
    cancelled: "취소",
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← 관리자 대시보드로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">문의 내역</h1>
          <p className="text-gray-600">병원별 문의 및 예약 요청을 확인합니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">전체 문의</div>
            <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">신규</div>
            <div className="text-2xl font-bold text-blue-600">
              {requests.filter((r) => r.status === "new").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">연락 완료</div>
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === "contacted").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">완료</div>
            <div className="text-2xl font-bold text-green-600">
              {requests.filter((r) => r.status === "completed").length}
            </div>
          </div>
        </div>

        {/* 문의 목록 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">등록된 문의가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      병원
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      언어
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/hospitals/${request.hospital.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {request.hospital.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{request.phone}</div>
                        {request.email && (
                          <div className="text-xs text-gray-500">{request.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.type === "inquiry" ? "일반 문의" : "예약 문의"}
                        {request.preferredAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(request.preferredAt).toLocaleDateString("ko-KR")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            statusColors[request.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusLabels[request.status] || request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.language === "ko"
                          ? "한국어"
                          : request.language === "en"
                            ? "English"
                            : request.language === "zh"
                              ? "中文"
                              : request.language === "ja"
                                ? "日本語"
                                : request.language || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 문의 상세 보기 (선택 시) */}
        {requests.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">문의 상세</h2>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border-b border-gray-200 pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.hospital.name} - {request.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[request.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabels[request.status] || request.status}
                    </span>
                  </div>
                  {request.message && (
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                      {request.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

