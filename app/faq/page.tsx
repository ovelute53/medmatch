"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FAQ {
  id: number;
  question: string;
  questionEn: string | null;
  answer: string;
  answerEn: string | null;
  category: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

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
      const res = await fetch(`/api/faq?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error("FAQ 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(id: number) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const categories = [
    { value: "all", label: "전체", labelEn: "All" },
    { value: "general", label: "일반", labelEn: "General" },
    { value: "reservation", label: "예약", labelEn: "Reservation" },
    { value: "treatment", label: "진료", labelEn: "Treatment" },
    { value: "payment", label: "결제", labelEn: "Payment" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center font-semibold transition-colors">
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                홈으로
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {language === "ko" ? "자주 묻는 질문" : "Frequently Asked Questions"}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {language === "ko" ? "궁금한 사항을 확인해보세요" : "Find answers to common questions"}
              </p>
            </div>
            <button
              onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors font-medium text-sm"
            >
              {language === "ko" ? "English" : "한국어"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 카테고리 필터 */}
        <div className="mb-8">
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
                {language === "ko" ? cat.label : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {language === "ko" ? "등록된 FAQ가 없습니다" : "No FAQs available"}
            </h3>
            <p className="text-gray-600">{language === "ko" ? "곧 추가될 예정입니다." : "Coming soon."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-primary-600 font-bold text-lg">Q</span>
                      <h3 className="text-lg font-bold text-gray-900">
                        {language === "ko" ? faq.question : (faq.questionEn || faq.question)}
                      </h3>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ${
                      openItems.has(faq.id) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openItems.has(faq.id) && (
                  <div className="px-6 pb-5 border-t border-gray-100 pt-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <span className="text-primary-600 font-bold text-lg mt-1">A</span>
                      <div className="flex-1">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {language === "ko" ? faq.answer : (faq.answerEn || faq.answer)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

