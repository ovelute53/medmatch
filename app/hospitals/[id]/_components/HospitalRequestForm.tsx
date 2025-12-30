"use client";

import { useState } from "react";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

interface HospitalRequestFormProps {
  hospitalId: number;
}

export default function HospitalRequestForm({ hospitalId }: HospitalRequestFormProps) {
  const [form, setForm] = useState({
    type: "inquiry",
    name: "",
    phone: "",
    email: "",
    language: "ko",
    message: "",
    preferredAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!form.name.trim() || !form.phone.trim()) {
      setMessage({ type: "error", text: "이름과 전화번호는 필수입니다." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          preferredAt: form.preferredAt || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "문의 전송에 실패했습니다.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "문의가 성공적으로 전송되었습니다! 병원에서 연락드리겠습니다.",
      });
      setForm({
        type: "inquiry",
        name: "",
        phone: "",
        email: "",
        language: "ko",
        message: "",
        preferredAt: "",
      });
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          문의 유형 *
        </label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="inquiry">일반 문의</option>
          <option value="reservation">예약 문의</option>
        </select>
      </div>

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
          전화번호 *
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="010-1234-5678"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          선호 언어
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

      {form.type === "reservation" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            희망 일시
          </label>
          <input
            type="datetime-local"
            value={form.preferredAt}
            onChange={(e) => setForm({ ...form, preferredAt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          문의 내용
        </label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="문의하실 내용을 입력해주세요..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
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
            전송 중...
          </>
        ) : (
          "문의하기"
        )}
      </button>
    </form>
  );
}

