"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentHospitals, type RecentHospital } from "@/lib/recent-hospitals";

export default function RecentHospitals() {
  const [recents, setRecents] = useState<RecentHospital[]>([]);

  useEffect(() => {
    setRecents(getRecentHospitals());
  }, []);

  if (recents.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">🕐</span>
          최근 본 병원
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {recents.map((hospital) => (
          <Link
            key={hospital.id}
            href={`/hospitals/${hospital.id}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-400 transition-all"
          >
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
              {hospital.name}
            </h3>
            {hospital.nameEn && (
              <p className="text-xs text-gray-600 mb-2 truncate">{hospital.nameEn}</p>
            )}
            <div className="flex items-center justify-between">
              {hospital.city && (
                <span className="text-xs text-gray-500">{hospital.city}</span>
              )}
              {hospital.rating && hospital.rating > 0 && (
                <span className="text-xs text-yellow-600 font-medium">
                  ⭐ {hospital.rating.toFixed(1)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

