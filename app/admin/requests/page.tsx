"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusDropdown from "./_components/StatusDropdown";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import ErrorMessage from "@/app/_components/ErrorMessage";

interface Hospital {
  id: number;
  name: string;
  nameEn: string | null;
}

interface Request {
  id: number;
  hospitalId: number;
  type: string;
  name: string;
  phone: string;
  email: string | null;
  language: string | null;
  message: string | null;
  status: string;
  preferredAt: Date | null;
  createdAt: Date;
  hospital: Hospital;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/requests");
      if (!res.ok) {
        throw new Error("문의 내역을 불러오는데 실패했습니다.");
      }
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (error: any) {
      console.error("문의 내역 로드 오류:", error);
      setError(error.message || "문의 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChange(requestId: number, newStatus: string) {
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
    );
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
          <p className="text-gray-600">병원별 문의 및 예약 요청을 확인하고 관리합니다.</p>
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
          {loading ? (
            <LoadingSpinner size="lg" text="문의 내역을 불러오는 중..." />
          ) : error ? (
            <div className="p-8">
              <ErrorMessage
                message={error}
                onRetry={() => {
                  loadRequests();
                }}
              />
            </div>
          ) : requests.length === 0 ? (
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
                        <StatusDropdown
                          requestId={request.id}
                          currentStatus={request.status}
                          onStatusChange={handleStatusChange}
                        />
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

        {/* 문의 상세 보기 */}
        {requests.length > 0 && !loading && (
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
                    <StatusDropdown
                      requestId={request.id}
                      currentStatus={request.status}
                      onStatusChange={handleStatusChange}
                    />
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
