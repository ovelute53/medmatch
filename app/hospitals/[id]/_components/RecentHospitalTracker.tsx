"use client";

import { useEffect } from "react";
import { addRecentHospital } from "@/lib/recent-hospitals";

interface RecentHospitalTrackerProps {
  hospital: {
    id: number;
    name: string;
    nameEn?: string | null;
    city?: string | null;
    rating?: number | null;
  };
}

export default function RecentHospitalTracker({ hospital }: RecentHospitalTrackerProps) {
  useEffect(() => {
    // 페이지 로드 시 최근 본 병원에 추가
    addRecentHospital({
      id: hospital.id,
      name: hospital.name,
      nameEn: hospital.nameEn || undefined,
      city: hospital.city || undefined,
      rating: hospital.rating || undefined,
    });
  }, [hospital]);

  return null; // UI를 렌더링하지 않음
}

