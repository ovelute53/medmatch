"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  image: string | null;
}

interface QnA {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  viewCount: number;
  answeredBy: string | null;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  user: User | null;
}

export default function QnAPage() {
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    loadQnAs();
  }, [selectedCategory, selectedStatus]);

  async function loadQnAs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      const res = await fetch(`/api/qna?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQnas(data.qnas || []);
      }
    } catch (error) {
      console.error("Q&A 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { value: "all", label: "전체" },
    { value: "general", label: "일반" },
    { value: "hospital", label: "병원" },
    { value: "treatment", label: "진료" },
    { value: "reservation", label: "예약" },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "답변 대기", color: "bg-yellow-100 text-yellow-800" },
    answered: { label: "답변 완료", color: "bg-green-100 text-green-800" },
    closed: { label: "종료", color: "bg-gray-100 text-gray-800" },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Q&A</h1>
          <p className="text-gray-600">질문하고 답변을 받아보세요.</p>
        </div>

        {/* 필터 */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                    selectedCategory === cat.value
                      ? "bg-primary-600 text-white border-primary-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:bg-primary-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">상태</label>
            <div className="flex gap-2">
              {["all", "pending", "answered"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                    selectedStatus === status
                      ? "bg-primary-600 text-white border-primary-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:bg-primary-50"
                  }`}
                >
                  {status === "all" ? "전체" : statusLabels[status]?.label || status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Q&A 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : qnas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">등록된 Q&A가 없습니다</h3>
            <p className="text-gray-600">새 질문을 작성해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {qnas.map((qna) => (
              <Link
                key={qna.id}
                href={`/qna/${qna.id}`}
                className="block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          statusLabels[qna.status]?.color || "bg-gray-100 text-gray-800"
                        }`}>
                          {statusLabels[qna.status]?.label || qna.status}
                        </span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold">
                          {categories.find((c) => c.value === qna.category)?.label || qna.category}
                        </span>
                        <span className="text-sm text-gray-500">조회 {qna.viewCount}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{qna.title}</h3>
                      <p className="text-gray-700 line-clamp-2 mb-3">{qna.content}</p>
                      {qna.answer && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-primary-600">답변:</span>
                            <span className="text-sm text-gray-600">
                              {qna.answeredBy || "관리자"}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-1">{qna.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <span>{qna.user?.name || "익명"}</span>
                    <span>{new Date(qna.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

