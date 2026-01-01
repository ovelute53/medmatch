"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

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

export default function QnADetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [qna, setQna] = useState<QnA | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setIsAdmin((session.user as any)?.role === "admin");
    }
  }, [session]);

  useEffect(() => {
    loadQnA();
  }, [params.id]);

  async function loadQnA() {
    setLoading(true);
    try {
      const res = await fetch(`/api/qna/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setQna(data.qna);
        if (data.qna.answer) {
          setAnswer(data.qna.answer);
        }
      } else {
        alert("Q&A를 찾을 수 없습니다.");
        router.push("/qna");
      }
    } catch (error) {
      console.error("Q&A 로드 실패:", error);
      alert("Q&A를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/qna/${params.id}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "답변 작성에 실패했습니다.");
      }

      await loadQnA();
      setShowAnswerForm(false);
      alert("답변이 작성되었습니다.");
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAnswer() {
    if (!confirm("답변을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/admin/qna/${params.id}/answer`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("답변 삭제에 실패했습니다.");
      }

      await loadQnA();
      setAnswer("");
      alert("답변이 삭제되었습니다.");
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    }
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "답변 대기", color: "bg-yellow-100 text-yellow-800" },
    answered: { label: "답변 완료", color: "bg-green-100 text-green-800" },
    closed: { label: "종료", color: "bg-gray-100 text-gray-800" },
  };

  const categories = [
    { value: "general", label: "일반" },
    { value: "hospital", label: "병원" },
    { value: "treatment", label: "진료" },
    { value: "reservation", label: "예약" },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!qna) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/qna"
            className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Q&A 목록으로
          </Link>
        </div>

        {/* 질문 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                statusLabels[qna.status]?.color || "bg-gray-100 text-gray-800"
              }`}>
                {statusLabels[qna.status]?.label || qna.status}
              </span>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold">
                {categories.find((c) => c.value === qna.category)?.label || qna.category}
              </span>
              <span className="text-sm text-gray-500">조회 {qna.viewCount}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{qna.title}</h1>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-line">{qna.content}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                {qna.user?.image && (
                  <img
                    src={qna.user.image}
                    alt={qna.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold text-gray-900">{qna.user?.name || "익명"}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(qna.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 답변 */}
        {qna.answer ? (
          <div className="bg-green-50 rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-green-800">답변</span>
                  <span className="text-sm text-gray-600">
                    {qna.answeredBy || "관리자"}
                  </span>
                  {qna.answeredAt && (
                    <span className="text-sm text-gray-500">
                      {new Date(qna.answeredAt).toLocaleString()}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (showAnswerForm) {
                        setShowAnswerForm(false);
                        setAnswer(qna.answer || "");
                      } else {
                        setShowAnswerForm(true);
                      }
                    }}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-semibold"
                  >
                    {showAnswerForm ? "취소" : "수정"}
                  </button>
                )}
              </div>

              {showAnswerForm && isAdmin ? (
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      {submitting ? "저장 중..." : "수정"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAnswer}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                    >
                      삭제
                    </button>
                  </div>
                </form>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-800 whitespace-pre-line">{qna.answer}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          isAdmin && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">답변 작성</h2>
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={8}
                    placeholder="답변 내용을 입력해주세요..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    {submitting ? "저장 중..." : "답변 작성"}
                  </button>
                </form>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}

