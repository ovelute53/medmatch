"use client";

import { useState } from "react";

type FormState = {
  name: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  description: string;
};

const initialState: FormState = {
  name: "",
  country: "Korea",
  city: "",
  address: "",
  phone: "",
  website: "",
  description: "",
};

export default function NewHospitalPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!form.name.trim()) return setMessage("병원명은 필수입니다.");
    if (!form.city.trim()) return setMessage("도시(city)는 필수입니다.");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error ?? "저장에 실패했습니다.");
        return;
      }

      setMessage("저장 완료! ✅");
      setForm(initialState);
    } catch {
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>병원 등록</h1>
      <p style={{ color: "#666" }}>관리자 전용: 병원 정보를 입력하고 저장합니다.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          병원명 *
          <input
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="예: Bonafide Orthopedics"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          국가
          <input
            value={form.country}
            onChange={(e) => onChange("country", e.target.value)}
            placeholder="예: Korea"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          도시(city) *
          <input
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="예: Seoul"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          주소
          <input
            value={form.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="예: 서울 관악구 ..."
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          전화
          <input
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="예: +82-10-1234-5678"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          웹사이트
          <input
            value={form.website}
            onChange={(e) => onChange("website", e.target.value)}
            placeholder="예: https://example.com"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          설명
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="예: 외국인 환자 대상 진료 가능, 통역 지원..."
            rows={5}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "저장 중..." : "저장하기"}
        </button>

        {message && <p style={{ marginTop: 4 }}>{message}</p>}
      </form>
    </main>
  );
}
