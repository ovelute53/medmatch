"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

function ArticleImage({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        <span className="text-6xl">📄</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="w-full h-auto object-cover"
      onError={() => setImageError(true)}
    />
  );
}

interface ArticleTag {
  id: number;
  tag: string;
}

interface Article {
  id: number;
  title: string;
  titleEn: string | null;
  content: string;
  contentEn: string | null;
  summary: string | null;
  summaryEn: string | null;
  category: string;
  imageUrl: string | null;
  author: string | null;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: ArticleTag[];
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"ko" | "en">("ko");

  const articleId = params?.id ? Number(params.id) : null;

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  async function loadArticle() {
    if (!articleId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data.article);
      } else {
        const data = await res.json();
        setError(data.error || "게시글을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      setError("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const categoryLabels: Record<string, { ko: string; en: string }> = {
    general: { ko: "일반", en: "General" },
    disease: { ko: "질환 정보", en: "Disease Info" },
    treatment: { ko: "치료 정보", en: "Treatment" },
    prevention: { ko: "예방", en: "Prevention" },
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {error || "게시글을 찾을 수 없습니다"}
            </h3>
            <Link
              href="/articles"
              className="inline-block mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const displayTitle = language === "ko" ? article.title : (article.titleEn || article.title);
  const displayContent = language === "ko" ? article.content : (article.contentEn || article.content);
  const displaySummary = language === "ko" ? article.summary : (article.summaryEn || article.summary);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/articles"
              className="text-primary-600 hover:text-primary-700 inline-flex items-center font-semibold transition-colors"
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              {language === "ko" ? "건강 정보 목록" : "Health Information"}
            </Link>
            <button
              onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors font-medium text-sm"
            >
              {language === "ko" ? "English" : "한국어"}
            </button>
          </div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 게시글 헤더 */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold">
              {language === "ko"
                ? categoryLabels[article.category]?.ko || article.category
                : categoryLabels[article.category]?.en || article.category}
            </span>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                  >
                    #{tag.tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {displayTitle}
          </h1>

          {displaySummary && (
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {displaySummary}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {article.author}
              </span>
            )}
            {article.publishedAt && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(article.publishedAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.viewCount}
            </span>
          </div>
        </header>

        {/* 게시글 이미지 */}
        {article.imageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <ArticleImage imageUrl={article.imageUrl} alt={displayTitle} />
          </div>
        )}

        {/* 게시글 본문 */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 lg:p-12 border border-gray-100 mb-8">
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
            dangerouslySetInnerHTML={{ __html: displayContent.replace(/\n/g, "<br />") }}
          />
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <Link
            href="/articles"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === "ko" ? "목록으로" : "Back to List"}
          </Link>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {article.updatedAt !== article.createdAt && (
              <span>
                {language === "ko" ? "최종 수정: " : "Last updated: "}
                {new Date(article.updatedAt).toLocaleDateString("ko-KR")}
              </span>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}

