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
    <section className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">🕐</span>
          최근 본 병원
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {recents.map((hospital) => (
          <Link
            key={hospital.id}
            href={`/hospitals/${hospital.id}`}
            className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-primary-400 hover:-translate-y-0.5 transition-all duration-200 bg-white group"
          >
            <h3 className="font-bold text-gray-900 text-sm mb-1.5 truncate group-hover:text-primary-600 transition-colors">
              {hospital.name}
            </h3>
            {hospital.nameEn && (
              <p className="text-xs text-gray-600 mb-3 truncate font-medium">{hospital.nameEn}</p>
            )}
            <div className="flex items-center justify-between">
              {hospital.city && (
                <span className="text-xs text-gray-500 font-medium">📍 {hospital.city}</span>
              )}
              {hospital.rating && hospital.rating > 0 && (
                <span className="text-xs text-yellow-700 font-bold bg-yellow-50 px-2 py-0.5 rounded-md">
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

