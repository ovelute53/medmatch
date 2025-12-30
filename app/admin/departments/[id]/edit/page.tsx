"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import ErrorMessage from "@/app/_components/ErrorMessage";

interface Department {
  id: number;
  name: string;
  nameEn: string;
  icon: string | null;
  description: string | null;
}

type FormState = {
  name: string;
  nameEn: string;
  icon: string;
  description: string;
};

const commonIcons = ["🏥", "💊", "🩺", "🦷", "👁️", "🧠", "❤️", "🫁", "🦴", "🧬"];

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = Number(params.id);

  const [department, setDepartment] = useState<Department | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    nameEn: "",
    icon: "🏥",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (departmentId) {
      loadDepartment();
    }
  }, [departmentId]);

  async function loadDepartment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/departments/${departmentId}`);
      if (!res.ok) {
        throw new Error("진료과 정보를 불러오는데 실패했습니다.");
      }
      const data = await res.json();
      if (data.department) {
        setDepartment(data.department);
        setForm({
          name: data.department.name,
          nameEn: data.department.nameEn,
          icon: data.department.icon || "🏥",
          description: data.department.description || "",
        });
      }
    } catch (error: any) {
      console.error("데이터 로드 오류:", error);
      setError(error.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError(null);

    if (!form.name.trim() || !form.nameEn.trim()) {
      setError("진료과명(한국어, 영어)은 필수입니다.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/departments/${departmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "수정에 실패했습니다.");
        return;
      }

      setMessage("수정 완료! ✅");
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("정말 이 진료과를 삭제하시겠습니까? 사용 중인 병원이 있으면 삭제할 수 없습니다.")) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/departments/${departmentId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "삭제에 실패했습니다.");
        return;
      }

      alert("진료과가 삭제되었습니다.");
      router.push("/admin");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <LoadingSpinner size="lg" text="진료과 정보를 불러오는 중..." />
        </div>
      </main>
    );
  }

  if (error && !department) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <ErrorMessage message={error} onRetry={loadDepartment} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                href="/admin"
                className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← 관리자 대시보드로
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">진료과 수정</h1>
              <p className="text-gray-600 mt-1">{department?.name}</p>
            </div>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              삭제
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  진료과명 (한국어) *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="예: 내과"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  진료과명 (영어) *
                </label>
                <input
                  value={form.nameEn}
                  onChange={(e) => onChange("nameEn", e.target.value)}
                  placeholder="예: Internal Medicine"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이콘 (이모지)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {commonIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => onChange("icon", icon)}
                    className={`text-2xl px-3 py-2 rounded-lg border-2 ${
                      form.icon === icon
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => onChange("icon", e.target.value)}
                placeholder="이모지를 입력하거나 선택하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
                placeholder="진료과에 대한 설명을 입력하세요..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {(error || message) && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes("완료")
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {error || message}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "저장 중..." : "저장하기"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

