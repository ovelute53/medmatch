"use client";

import { useState } from "react";

interface StatusDropdownProps {
  requestId: number;
  currentStatus: string;
  onStatusChange: (requestId: number, newStatus: string) => void;
}

const statusOptions = [
  { value: "new", label: "신규", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "연락 완료", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "완료", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "취소", color: "bg-red-100 text-red-800" },
];

export default function StatusDropdown({
  requestId,
  currentStatus,
  onStatusChange,
}: StatusDropdownProps) {
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: string) {
    if (newStatus === currentStatus) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "상태 변경에 실패했습니다.");
        return;
      }

      onStatusChange(requestId, newStatus);
    } catch (error) {
      console.error("상태 변경 오류:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const currentStatusOption = statusOptions.find((opt) => opt.value === currentStatus);

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={loading}
      className={`px-2 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${
        currentStatusOption?.color || "bg-gray-100 text-gray-800"
      } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

