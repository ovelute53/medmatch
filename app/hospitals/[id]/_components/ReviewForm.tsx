"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import StarRating from "@/app/_components/StarRating";

interface ReviewFormProps {
  hospitalId: number;
  onReviewSubmitted: () => void;
}

interface ImageFile {
  file: File;
  preview: string;
  url?: string; // 업로드된 URL
}

export default function ReviewForm({ hospitalId, onReviewSubmitted }: ReviewFormProps) {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 0.5,
    title: "",
    content: "",
    language: "ko",
  });
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }));
    }
  }, [session]);

  // 이미지 선택 핸들러
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 이미지 파일만 허용
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "이미지 파일만 업로드할 수 있습니다." });
        continue;
      }

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "각 이미지 파일은 5MB를 초과할 수 없습니다." });
        continue;
      }

      // 최대 5개까지만
      if (images.length + newImages.length >= 5) {
        setMessage({ type: "error", text: "이미지는 최대 5개까지 업로드할 수 있습니다." });
        break;
      }

      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
    }

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // 이미지 삭제
  function handleImageRemove(index: number) {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview); // 메모리 정리
      newImages.splice(index, 1);
      return newImages;
    });
  }

  // 이미지 업로드
  async function uploadImages(): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      if (image.url) {
        // 이미 업로드된 이미지
        uploadedUrls.push(image.url);
        continue;
      }

      const formData = new FormData();
      formData.append("file", image.file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          throw new Error(data.error || "이미지 업로드 실패");
        }
      } catch (error) {
        console.error("이미지 업로드 오류:", error);
        throw error;
      }
    }

    return uploadedUrls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!form.name.trim() || !form.content.trim()) {
      setMessage({ type: "error", text: "이름과 리뷰 내용은 필수입니다." });
      return;
    }

    if (form.rating < 0.5 || form.rating > 5) {
      setMessage({ type: "error", text: "평점은 0.5-5 사이여야 합니다." });
      return;
    }

    setLoading(true);
    try {
      // 이미지 업로드
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploadingImages(true);
        try {
          imageUrls = await uploadImages();
        } catch (error: any) {
          setMessage({
            type: "error",
            text: error.message || "이미지 업로드에 실패했습니다.",
          });
          setUploadingImages(false);
          setLoading(false);
          return;
        }
        setUploadingImages(false);
      }

      // 리뷰 생성
      const requestBody = {
        ...form,
        userId: session?.user?.id || undefined,
      };

      const res = await fetch(`/api/hospitals/${hospitalId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "리뷰 작성에 실패했습니다.",
        });
        return;
      }

      const reviewId = data.review?.id;
      if (reviewId && imageUrls.length > 0) {
        // 이미지들을 리뷰에 연결
        for (let i = 0; i < imageUrls.length; i++) {
          try {
            const imageRes = await fetch(`/api/reviews/${reviewId}/images`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageUrl: imageUrls[i],
                order: i,
              }),
            });
            
            if (!imageRes.ok) {
              const imageError = await imageRes.json();
              console.error("이미지 연결 오류:", imageError);
              throw new Error(imageError.error || "이미지 연결에 실패했습니다.");
            }
          } catch (error: any) {
            console.error("이미지 연결 오류:", error);
            // 이미지 연결 실패 시 에러 메시지 표시
            setMessage({
              type: "error",
              text: `리뷰는 작성되었으나 이미지 연결에 실패했습니다: ${error.message}`,
            });
          }
        }
      }

      setMessage({
        type: "success",
        text: "리뷰가 성공적으로 작성되었습니다!",
      });
      
      // 폼 초기화
      setForm({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        rating: 0.5,
        title: "",
        content: "",
        language: "ko",
      });
      
      // 이미지 초기화
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
      
      onReviewSubmitted();
    } catch (error) {
      setMessage({
        type: "error",
        text: "네트워크 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">리뷰 작성</h3>

      {!session && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="홍길동"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 (선택사항)
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </>
      )}
      {session && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          로그인된 사용자: {session.user?.name} ({session.user?.email})
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          평점 * (0.5-5점, 0.5점 단위)
        </label>
        <div className="mb-1">
          <StarRating
            value={form.rating}
            onChange={(rating) => setForm({ ...form, rating })}
            maxRating={5}
            allowHalf={true}
            size="lg"
            hospitalId={hospitalId}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">별의 왼쪽 절반을 클릭하면 0.5점, 오른쪽 절반을 클릭하면 1점씩 선택됩니다.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          제목 (선택사항)
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="리뷰 제목을 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          리뷰 내용 *
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="병원에 대한 리뷰를 작성해주세요..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          작성 언어
        </label>
        <select
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>

      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사진 첨부 (선택사항, 최대 5개)
        </label>
        <div className="space-y-3">
          {/* 이미지 미리보기 */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.preview}
                    alt={`미리보기 ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 파일 선택 버튼 */}
          {images.length < 5 && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="review-images"
              />
              <label
                htmlFor="review-images"
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-sm text-gray-700">사진 추가</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, WebP, GIF (각 5MB 이하)
              </p>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || uploadingImages}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0"
      >
        {uploadingImages ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-4 border-white border-t-transparent mr-2"></div>
            이미지 업로드 중...
          </>
        ) : loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-4 border-white border-t-transparent mr-2"></div>
            작성 중...
          </>
        ) : (
          "리뷰 작성하기"
        )}
      </button>
    </form>
  );
}

