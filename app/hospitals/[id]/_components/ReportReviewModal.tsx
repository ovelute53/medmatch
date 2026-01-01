"use client";

import { useState } from "react";

interface ReportReviewModalProps {
  reviewId: number;
  hospitalId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REPORT_REASONS = [
  { value: "spam", label: "스팸 또는 광고" },
  { value: "inappropriate", label: "부적절한 내용" },
  { value: "false", label: "거짓 정보" },
  { value: "harassment", label: "욕설 또는 괴롭힘" },
  { value: "other", label: "기타" },
];

export default function ReportReviewModal({
  reviewId,
  hospitalId,
  isOpen,
  onClose,
  onSuccess,
}: ReportReviewModalProps) {
  const [form, setForm] = useState({
    reason: "",
    description: "",
    reporterName: "",
    reporterEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.reason) {
      setError("신고 사유를 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/hospitals/${hospitalId}/reviews/${reviewId}/report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "신고 처리에 실패했습니다.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setForm({
          reason: "",
          description: "",
          reporterName: "",
          reporterEmail: "",
        });
        setSuccess(false);
      }, 1500);
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">리뷰 신고</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <p className="text-gray-900 font-medium">신고가 접수되었습니다.</p>
            <p className="text-sm text-gray-500 mt-2">
              검토 후 조치하겠습니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신고 사유 *
              </label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">선택해주세요</option>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 설명 (선택사항)
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="신고 사유에 대한 자세한 설명을 입력해주세요."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신고자 이름 (선택사항)
              </label>
              <input
                type="text"
                value={form.reporterName}
                onChange={(e) =>
                  setForm({ ...form, reporterName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="이름을 입력해주세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신고자 이메일 (선택사항)
              </label>
              <input
                type="email"
                value={form.reporterEmail}
                onChange={(e) =>
                  setForm({ ...form, reporterEmail: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@example.com"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? "신고 중..." : "신고하기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

