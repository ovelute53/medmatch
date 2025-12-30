"use client";

import { useState } from "react";
import StarRating from "@/app/_components/StarRating";

interface ReviewFormProps {
  hospitalId: number;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ hospitalId, onReviewSubmitted }: ReviewFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 0.5,
    title: "",
    content: "",
    language: "ko",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!form.name.trim() || !form.content.trim()) {
      setMessage({ type: "error", text: "이름과 리뷰 내용은 필수입니다." });
      return;
    }

    if (form.rating < 0.5 || form.rating > 5) {
      setMessage({ type: "error", text: "평점은 0.5-5 사이여야 합니다." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "리뷰 작성에 실패했습니다.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "리뷰가 성공적으로 작성되었습니다!",
      });
      setForm({
        name: "",
        email: "",
        rating: 0.5,
        title: "",
        content: "",
        language: "ko",
      });
      onReviewSubmitted();
    } catch (error) {
      setMessage({
        type: "error",
        text: "네트워크 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">리뷰 작성</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름 *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="홍길동"
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
          placeholder="example@email.com"
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
            size="lg"
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
          placeholder="리뷰 제목을 입력하세요"
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
          placeholder="병원에 대한 리뷰를 작성해주세요..."
          rows={4}
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

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            작성 중...
          </>
        ) : (
          "리뷰 작성하기"
        )}
      </button>
    </form>
  );
}

