"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FAQ {
  id: number;
  question: string;
  questionEn: string | null;
  answer: string;
  answerEn: string | null;
  category: string;
  order: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminFAQPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    questionEn: "",
    answer: "",
    answerEn: "",
    category: "general",
    order: 0,
  });

  useEffect(() => {
    loadFAQs();
  }, [selectedCategory]);

  async function loadFAQs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      const res = await fetch(`/api/admin/faq?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
      } else if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("FAQ 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(faq: FAQ) {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      questionEn: faq.questionEn || "",
      answer: faq.answer,
      answerEn: faq.answerEn || "",
      category: faq.category,
      order: faq.order,
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      question: "",
      questionEn: "",
      answer: "",
      answerEn: "",
      category: "general",
      order: 0,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("질문과 답변은 필수입니다.");
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/faq/${editingId}`
        : "/api/admin/faq";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "저장에 실패했습니다.");
      }

      await loadFAQs();
      handleCancel();
      alert(editingId ? "FAQ가 수정되었습니다." : "FAQ가 생성되었습니다.");
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/admin/faq/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("삭제에 실패했습니다.");
      }

      await loadFAQs();
      alert("FAQ가 삭제되었습니다.");
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    }
  }

  const categories = [
    { value: "all", label: "전체" },
    { value: "general", label: "일반" },
    { value: "reservation", label: "예약" },
    { value: "treatment", label: "진료" },
    { value: "payment", label: "결제" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            관리자 대시보드
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">FAQ 관리</h1>
              <p className="text-gray-600">자주 묻는 질문을 관리합니다.</p>
            </div>
            <button
              onClick={() => {
                handleCancel();
                setShowForm(true);
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              + 새 FAQ 추가
            </button>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-6">
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

        {/* FAQ 작성/수정 폼 */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? "FAQ 수정" : "새 FAQ 추가"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    질문 (한국어) *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    질문 (영어)
                  </label>
                  <input
                    type="text"
                    value={formData.questionEn}
                    onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    답변 (한국어) *
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    답변 (영어)
                  </label>
                  <textarea
                    value={formData.answerEn}
                    onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    카테고리
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="general">일반</option>
                    <option value="reservation">예약</option>
                    <option value="treatment">진료</option>
                    <option value="payment">결제</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    정렬 순서
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  {editingId ? "수정" : "생성"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FAQ 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">등록된 FAQ가 없습니다</h3>
            <p className="text-gray-600">새 FAQ를 추가해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold">
                          {categories.find((c) => c.value === faq.category)?.label || faq.category}
                        </span>
                        <span className="text-sm text-gray-500">순서: {faq.order}</span>
                        <span className="text-sm text-gray-500">조회: {faq.viewCount}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                      {faq.questionEn && (
                        <p className="text-sm text-gray-600 mb-2">{faq.questionEn}</p>
                      )}
                      <p className="text-gray-700 whitespace-pre-line">{faq.answer}</p>
                      {faq.answerEn && (
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{faq.answerEn}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

