"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

interface ReviewReport {
  id: number;
  reviewId: number;
  reason: string;
  description: string | null;
  reporterName: string | null;
  reporterEmail: string | null;
  status: string;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  review: {
    id: number;
    name: string;
    email: string | null;
    rating: number;
    title: string | null;
    content: string;
    language: string | null;
    isVerified: boolean;
    createdAt: Date;
    hospital: {
      id: number;
      name: string;
    };
  };
}

const STATUS_OPTIONS = [
  { value: "pending", label: "대기중", color: "bg-yellow-100 text-yellow-800" },
  { value: "reviewed", label: "검토중", color: "bg-blue-100 text-blue-800" },
  { value: "resolved", label: "처리완료", color: "bg-green-100 text-green-800" },
  { value: "dismissed", label: "기각", color: "bg-gray-100 text-gray-800" },
];

const REASON_LABELS: Record<string, string> = {
  spam: "스팸 또는 광고",
  inappropriate: "부적절한 내용",
  false: "거짓 정보",
  harassment: "욕설 또는 괴롭힘",
  other: "기타",
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({
    status: "",
    adminNote: "",
  });

  useEffect(() => {
    loadReport();
  }, [reportId]);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`);
      if (!res.ok) {
        throw new Error("신고 정보를 불러오는데 실패했습니다.");
      }
      const data = await res.json();
      setReport(data.report);
      setForm({
        status: data.report.status,
        adminNote: data.report.adminNote || "",
      });
    } catch (error: any) {
      console.error("신고 로드 오류:", error);
      setError(error.message || "신고 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus() {
    if (!form.status) {
      alert("상태를 선택해주세요.");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "상태 업데이트에 실패했습니다.");
        return;
      }

      alert("상태가 업데이트되었습니다.");
      loadReport();
    } catch (error) {
      console.error("상태 업데이트 오류:", error);
      alert("상태 업데이트 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("정말 이 신고를 삭제하시겠습니까?")) {
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "신고 삭제에 실패했습니다.");
        return;
      }

      alert("신고가 삭제되었습니다.");
      router.push("/admin/reports");
    } catch (error) {
      console.error("신고 삭제 오류:", error);
      alert("신고 삭제 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="신고 정보를 불러오는 중..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error || "신고를 찾을 수 없습니다."}
        </div>
        <Link
          href="/admin/reports"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          ← 신고 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === report.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/reports"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← 신고 목록으로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">신고 상세 정보</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 신고 정보 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">신고 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">신고일시</label>
              <p className="text-gray-900">
                {new Date(report.createdAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">신고 사유</label>
              <p className="text-gray-900">
                {REASON_LABELS[report.reason] || report.reason}
              </p>
            </div>
            {report.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">상세 설명</label>
                <p className="text-gray-900 whitespace-pre-wrap">{report.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">신고자</label>
              <p className="text-gray-900">
                {report.reporterName || report.reporterEmail || "익명"}
                {report.reporterEmail && (
                  <span className="text-gray-500 ml-2">({report.reporterEmail})</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">현재 상태</label>
              <div className="mt-1">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    currentStatus?.color || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {currentStatus?.label || report.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 리뷰 정보 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">신고된 리뷰</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">병원</label>
              <p className="text-gray-900">
                <Link
                  href={`/hospitals/${report.review.hospital.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {report.review.hospital.name}
                </Link>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">작성자</label>
              <p className="text-gray-900">{report.review.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">평점</label>
              <p className="text-gray-900">{report.review.rating}점</p>
            </div>
            {report.review.title && (
              <div>
                <label className="text-sm font-medium text-gray-500">제목</label>
                <p className="text-gray-900">{report.review.title}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">내용</label>
              <p className="text-gray-900 whitespace-pre-wrap">{report.review.content}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">작성일시</label>
              <p className="text-gray-900">
                {new Date(report.review.createdAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <Link
                href={`/hospitals/${report.review.hospital.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                리뷰 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 관리자 작업 영역 */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">상태 관리</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태 변경
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 메모
            </label>
            <textarea
              value={form.adminNote}
              onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="상태 변경 사유나 처리 내용을 기록하세요."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updating ? "저장 중..." : "상태 업데이트"}
            </button>
            <button
              onClick={handleDelete}
              disabled={updating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              신고 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

