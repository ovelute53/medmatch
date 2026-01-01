"use client";

import { useState } from "react";
import StarRating from "@/app/_components/StarRating";

interface EditReviewFormProps {
  hospitalId: number;
  reviewId: number;
  initialData: {
    name: string;
    email: string | null;
    rating: number;
    title: string | null;
    content: string;
    language: string | null;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditReviewForm({
  hospitalId,
  reviewId,
  initialData,
  onCancel,
  onSuccess,
}: EditReviewFormProps) {
  const [form, setForm] = useState({
    name: initialData.name,
    email: initialData.email || "",
    rating: Number(initialData.rating) || 0,
    title: initialData.title || "",
    content: initialData.content,
    language: initialData.language || "ko",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.content.trim()) {
      setError("이름과 리뷰 내용은 필수입니다.");
      return;
    }

    if (form.rating < 0.5 || form.rating > 5) {
      setError("평점은 0.5-5 사이여야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "리뷰 수정에 실패했습니다.");
        return;
      }

      onSuccess();
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-medium text-gray-900 mb-3">리뷰 수정</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름 *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일 (선택사항)
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          평점 * (0.5-5점, 0.5점 단위)
        </label>
        <div className="mb-1">
          <StarRating
            value={form.rating}
            onChange={(rating) => setForm({ ...form, rating })}
            maxRating={5}
            allowHalf={true}
            size="md"
            hospitalId={hospitalId}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">별의 왼쪽 절반을 클릭하면 0.5점, 오른쪽 절반을 클릭하면 1점씩 선택됩니다.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          제목 (선택사항)
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          리뷰 내용 *
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          작성 언어
        </label>
        <select
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>

      {error && (
        <div className="p-2 bg-red-50 text-red-800 text-sm rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0"
        >
          {loading ? "수정 중..." : "수정하기"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          취소
        </button>
      </div>
    </form>
  );
}

