"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: ArticleTag[];
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    titleEn: "",
    content: "",
    contentEn: "",
    summary: "",
    summaryEn: "",
    category: "general",
    imageUrl: "",
    author: "",
    tags: [] as string[],
    isPublished: false,
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, publishedFilter]);

  async function loadArticles() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (publishedFilter !== "all") {
        params.append("isPublished", publishedFilter === "published" ? "true" : "false");
      }
      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      } else if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Article 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(article: Article) {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      titleEn: article.titleEn || "",
      content: article.content,
      contentEn: article.contentEn || "",
      summary: article.summary || "",
      summaryEn: article.summaryEn || "",
      category: article.category,
      imageUrl: article.imageUrl || "",
      author: article.author || "",
      tags: article.tags.map((t) => t.tag),
      isPublished: article.isPublished,
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      titleEn: "",
      content: "",
      contentEn: "",
      summary: "",
      summaryEn: "",
      category: "general",
      imageUrl: "",
      author: "",
      tags: [],
      isPublished: false,
    });
    setTagInput("");
  }

  function handleAddTag() {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput("");
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tagToRemove) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 본문은 필수입니다.");
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/articles/${editingId}`
        : "/api/admin/articles";
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

      await loadArticles();
      handleCancel();
      alert(editingId ? "Article이 수정되었습니다." : "Article이 생성되었습니다.");
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("삭제에 실패했습니다.");
      }

      await loadArticles();
      alert("Article이 삭제되었습니다.");
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    }
  }

  const categories = [
    { value: "all", label: "전체" },
    { value: "general", label: "일반" },
    { value: "disease", label: "질병" },
    { value: "treatment", label: "치료" },
    { value: "prevention", label: "예방" },
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">건강 정보(Article) 관리</h1>
              <p className="text-gray-600">건강 정보 게시글을 관리합니다.</p>
            </div>
            <button
              onClick={() => {
                handleCancel();
                setShowForm(true);
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              + 새 Article 추가
            </button>
          </div>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">게시 상태</label>
            <div className="flex gap-2">
              {["all", "published", "draft"].map((status) => (
                <button
                  key={status}
                  onClick={() => setPublishedFilter(status)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                    publishedFilter === status
                      ? "bg-primary-600 text-white border-primary-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:bg-primary-50"
                  }`}
                >
                  {status === "all" ? "전체" : status === "published" ? "게시됨" : "임시저장"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Article 작성/수정 폼 */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? "Article 수정" : "새 Article 추가"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    제목 (한국어) *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    제목 (영어)
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    요약 (한국어)
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    요약 (영어)
                  </label>
                  <textarea
                    value={formData.summaryEn}
                    onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    본문 (한국어) *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    본문 (영어)
                  </label>
                  <textarea
                    value={formData.contentEn}
                    onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value="disease">질병</option>
                    <option value="treatment">치료</option>
                    <option value="prevention">예방</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    이미지 URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    작성자
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  태그
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="태그 입력 후 Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-semibold"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-primary-700 hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">게시하기</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  {editingId ? "수정" : formData.isPublished ? "게시하기" : "임시저장"}
                </button>
                {!formData.isPublished && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, isPublished: true });
                      const form = e.currentTarget.closest('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    바로 게시하기
                  </button>
                )}
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

        {/* Article 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">등록된 Article이 없습니다</h3>
            <p className="text-gray-600">새 Article을 추가해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          article.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {article.isPublished ? "게시됨" : "임시저장"}
                        </span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold">
                          {categories.find((c) => c.value === article.category)?.label || article.category}
                        </span>
                        {article.imageUrl && (
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{article.title}</h3>
                      {article.titleEn && (
                        <p className="text-sm text-gray-600 mb-2">{article.titleEn}</p>
                      )}
                      {article.summary && (
                        <p className="text-gray-700 mb-2">{article.summary}</p>
                      )}
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {article.content.substring(0, 150)}...
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {article.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-primary-50 text-primary-600 rounded text-xs font-medium"
                          >
                            #{tag.tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        작성자: {article.author || "미정"} | 조회: {article.viewCount} | 
                        {article.publishedAt && ` 게시일: ${new Date(article.publishedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(article)}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
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

