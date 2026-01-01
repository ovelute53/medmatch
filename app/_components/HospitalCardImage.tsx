"use client";

import { useState } from "react";

interface HospitalCardImageProps {
  imageUrl: string | null;
  name: string;
  heightClass?: string;
}

export default function HospitalCardImage({
  imageUrl,
  name,
  heightClass = "h-48",
}: HospitalCardImageProps) {
  const [imageError, setImageError] = useState(false);

  if (!imageUrl || imageError) {
    return (
      <div className={`${heightClass} bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center`}>
        <span className="text-6xl">🏥</span>
      </div>
    );
  }

  return (
    <>
      <img
        src={imageUrl}
        alt={name}
        className={`w-full ${heightClass} object-cover group-hover:scale-110 transition-transform duration-500`}
        onError={() => setImageError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </>
  );
}

