"use client";

import { useState } from "react";

interface HospitalImageProps {
  imageUrl: string | null;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export default function HospitalImage({
  imageUrl,
  name,
  className = "w-full h-64 md:h-96 object-cover",
  fallbackClassName = "bg-gradient-to-br from-primary-100 to-primary-200 h-64 md:h-96 flex items-center justify-center",
}: HospitalImageProps) {
  const [imageError, setImageError] = useState(false);

  if (!imageUrl || imageError) {
    return (
      <div className={fallbackClassName}>
        <span className="text-8xl">🏥</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}

