"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ReviewImage {
  id: number;
  imageUrl: string;
  caption: string | null;
  order: number;
}

interface ReviewImageGalleryProps {
  reviewId: number;
}

export default function ReviewImageGallery({ reviewId }: ReviewImageGalleryProps) {
  const [images, setImages] = useState<ReviewImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ReviewImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, [reviewId]);

  async function loadImages() {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/images`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      } else {
        setError("이미지를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 로드 오류:", error);
      setError("이미지를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-xs text-red-600">{error}</div>;
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.imageUrl}
              alt={image.caption || "리뷰 이미지"}
              className="w-full h-full object-cover"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-opacity z-10"
            >
              ✕
            </button>
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.caption || "리뷰 이미지"}
              className="w-full h-full object-contain"
            />
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-4">
                <p className="text-sm text-gray-800">{selectedImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

