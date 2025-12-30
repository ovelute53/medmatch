import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ReportsPage() {
  let reports: any[] = [];
  let error: string | null = null;

  try {
    reports = await prisma.reviewReport.findMany({
      include: {
        review: {
          include: {
            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e: any) {
    console.error("신고 목록 조회 오류:", e);
    error = e.message || "신고 목록을 불러오는데 실패했습니다.";
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "대기중", color: "bg-yellow-100 text-yellow-800" },
    reviewed: { label: "검토중", color: "bg-blue-100 text-blue-800" },
    resolved: { label: "처리완료", color: "bg-green-100 text-green-800" },
    dismissed: { label: "기각", color: "bg-gray-100 text-gray-800" },
  };

  const reasonLabels: Record<string, string> = {
    spam: "스팸 또는 광고",
    inappropriate: "부적절한 내용",
    false: "거짓 정보",
    harassment: "욕설 또는 괴롭힘",
    other: "기타",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">리뷰 신고 관리</h1>
        <Link
          href="/admin"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 관리자 홈
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">신고된 리뷰가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신고일시
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    병원
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    리뷰 내용
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신고 사유
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신고자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.createdAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/hospitals/${report.review.hospital.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {report.review.hospital.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {report.review.title && (
                          <div className="font-medium">{report.review.title}</div>
                        )}
                        <div className="text-gray-600 truncate">
                          {report.review.content}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reasonLabels[report.reason] || report.reason}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.reporterName || report.reporterEmail || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusLabels[report.status]?.color ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusLabels[report.status]?.label || report.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm sticky right-0 bg-white">
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

