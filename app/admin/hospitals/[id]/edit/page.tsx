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
}

interface Hospital {
  id: number;
  name: string;
  nameEn: string | null;
  address: string;
  city: string | null;
  country: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number;
  departments: Array<{ department: Department }>;
}

type FormState = {
  name: string;
  nameEn: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  descriptionEn: string;
  imageUrl: string;
  departmentIds: number[];
};

export default function EditHospitalPage() {
  const router = useRouter();
  const params = useParams();
  const hospitalId = Number(params.id);

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState<FormState>({
    name: "",
    nameEn: "",
    country: "Korea",
    city: "",
    address: "",
    phone: "",
    website: "",
    description: "",
    descriptionEn: "",
    imageUrl: "",
    departmentIds: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (hospitalId) {
      loadData();
    }
  }, [hospitalId]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [hospitalRes, departmentsRes] = await Promise.all([
        fetch(`/api/admin/hospitals/${hospitalId}`),
        fetch("/api/departments"),
      ]);

      if (!hospitalRes.ok) {
        throw new Error("병원 정보를 불러오는데 실패했습니다.");
      }

      const hospitalData = await hospitalRes.json();
      const departmentsData = await departmentsRes.json();

      if (hospitalData.hospital) {
        setHospital(hospitalData.hospital);
        setForm({
          name: hospitalData.hospital.name,
          nameEn: hospitalData.hospital.nameEn || "",
          country: hospitalData.hospital.country,
          city: hospitalData.hospital.city || "",
          address: hospitalData.hospital.address,
          phone: hospitalData.hospital.phone || "",
          website: hospitalData.hospital.website || "",
          description: hospitalData.hospital.description || "",
          descriptionEn: hospitalData.hospital.descriptionEn || "",
          imageUrl: hospitalData.hospital.imageUrl || "",
          departmentIds: hospitalData.hospital.departments.map(
            (hd: { department: Department }) => hd.department.id
          ),
        });
      }

      if (departmentsData.departments) {
        setDepartments(departmentsData.departments);
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

  function toggleDepartment(deptId: number) {
    setForm((prev) => ({
      ...prev,
      departmentIds: prev.departmentIds.includes(deptId)
        ? prev.departmentIds.filter((id) => id !== deptId)
        : [...prev.departmentIds, deptId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError(null);

    if (!form.name.trim()) {
      setError("병원명은 필수입니다.");
      return;
    }
    if (!form.address.trim()) {
      setError("주소는 필수입니다.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/hospitals/${hospitalId}`, {
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
    if (!confirm("정말 이 병원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/hospitals/${hospitalId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "삭제에 실패했습니다.");
        return;
      }

      alert("병원이 삭제되었습니다.");
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
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner size="lg" text="병원 정보를 불러오는 중..." />
        </div>
      </main>
    );
  }

  if (error && !hospital) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <ErrorMessage message={error} onRetry={loadData} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                href="/admin"
                className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← 관리자 대시보드로
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">병원 수정</h1>
              <p className="text-gray-600 mt-1">{hospital?.name}</p>
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
            {/* 기존 폼 필드들 - new 페이지와 동일한 구조 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  병원명 (한국어) *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="예: 서울대학교병원"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  병원명 (영어)
                </label>
                <input
                  value={form.nameEn}
                  onChange={(e) => onChange("nameEn", e.target.value)}
                  placeholder="예: Seoul National University Hospital"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  국가
                </label>
                <input
                  value={form.country}
                  onChange={(e) => onChange("country", e.target.value)}
                  placeholder="예: Korea"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  도시
                </label>
                <input
                  value={form.city}
                  onChange={(e) => onChange("city", e.target.value)}
                  placeholder="예: Seoul"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="예: +82-2-1234-5678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주소 *
              </label>
              <input
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
                placeholder="예: 서울특별시 종로구 대학로 101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                웹사이트
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => onChange("website", e.target.value)}
                placeholder="예: https://www.snuh.org"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이미지 URL
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => onChange("imageUrl", e.target.value)}
                placeholder="예: https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                진료과 선택
              </label>
              <div className="flex flex-wrap gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                {departments.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    등록된 진료과가 없습니다. 먼저 진료과를 등록해주세요.
                  </p>
                ) : (
                  departments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => toggleDepartment(dept.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        form.departmentIds.includes(dept.id)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                      }`}
                    >
                      <span className="mr-2">{dept.icon || "🏥"}</span>
                      {dept.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명 (한국어)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
                placeholder="예: 외국인 환자 대상 진료 가능, 통역 지원..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명 (영어)
              </label>
              <textarea
                value={form.descriptionEn}
                onChange={(e) => onChange("descriptionEn", e.target.value)}
                placeholder="예: Medical services for foreign patients, translation support..."
                rows={4}
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

