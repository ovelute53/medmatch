"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  titleEn: string | null;
  summary: string | null;
  summaryEn: string | null;
  category: string;
  imageUrl: string | null;
  author: string | null;
  viewCount: number;
  publishedAt: string | null;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [language, setLanguage] = useState<"ko" | "en">("ko");

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  async function loadArticles() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      const res = await fetch(`/api/articles?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error("게시글 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { value: "all", label: "전체", labelEn: "All" },
    { value: "general", label: "일반", labelEn: "General" },
    { value: "disease", label: "질환 정보", labelEn: "Disease Info" },
    { value: "treatment", label: "치료 정보", labelEn: "Treatment" },
    { value: "prevention", label: "예방", labelEn: "Prevention" },
  ];

  const categoryLabels: Record<string, { ko: string; en: string }> = {
    general: { ko: "일반", en: "General" },
    disease: { ko: "질환 정보", en: "Disease Info" },
    treatment: { ko: "치료 정보", en: "Treatment" },
    prevention: { ko: "예방", en: "Prevention" },
  };

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
                {language === "ko" ? "건강 정보" : "Health Information"}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {language === "ko" ? "유용한 건강 정보를 확인해보세요" : "Check out useful health information"}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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

        {/* 게시글 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {language === "ko" ? "등록된 게시글이 없습니다" : "No articles available"}
            </h3>
            <p className="text-gray-600">{language === "ko" ? "곧 추가될 예정입니다." : "Coming soon."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group"
              >
                {article.imageUrl && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={language === "ko" ? article.title : (article.titleEn || article.title)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold">
                      {language === "ko"
                        ? categoryLabels[article.category]?.ko || article.category
                        : categoryLabels[article.category]?.en || article.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      👁️ {article.viewCount}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {language === "ko" ? article.title : (article.titleEn || article.title)}
                  </h3>
                  {(article.summary || article.summaryEn) && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {language === "ko" ? article.summary : (article.summaryEn || article.summary)}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {article.author && <span>{article.author}</span>}
                    {article.publishedAt && (
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    )}
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

