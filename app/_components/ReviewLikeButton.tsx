"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ReviewLikeButtonProps {
  reviewId: number;
  initialLikeCount?: number;
  initialDislikeCount?: number;
}

export default function ReviewLikeButton({
  reviewId,
  initialLikeCount = 0,
  initialDislikeCount = 0,
}: ReviewLikeButtonProps) {
  const { data: session, status } = useSession();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [userLike, setUserLike] = useState<boolean | null>(null); // true: 좋아요, false: 싫어요, null: 미선택
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      loadUserLike();
    }
  }, [reviewId, status]);

  async function loadUserLike() {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`);
      if (res.ok) {
        const data = await res.json();
        setUserLike(data.userLike);
      }
    } catch (error) {
      console.error("좋아요 상태 로드 오류:", error);
    }
  }

  async function handleLike(isLike: boolean) {
    if (status !== "authenticated") {
      alert("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLike }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "처리 중 오류가 발생했습니다.");
        return;
      }

      // 상태 업데이트
      if (data.counts) {
        setLikeCount(data.counts.likeCount);
        setDislikeCount(data.counts.dislikeCount);
      }

      // 사용자의 현재 선택 상태 업데이트
      if (data.data === null) {
        // 취소된 경우
        setUserLike(null);
      } else {
        setUserLike(data.data.isLike);
      }
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => handleLike(true)}
        disabled={loading}
        className={`
          flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${
            userLike === true
              ? "bg-blue-100 text-blue-700 border-2 border-blue-400"
              : "bg-gray-100 text-gray-700 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200"
          }
        `}
        title={status === "authenticated" ? "좋아요" : "로그인이 필요합니다"}
      >
        <span className="text-base">{userLike === true ? "👍" : "👍🏻"}</span>
        <span>{likeCount}</span>
      </button>

      <button
        onClick={() => handleLike(false)}
        disabled={loading}
        className={`
          flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${
            userLike === false
              ? "bg-red-100 text-red-700 border-2 border-red-400"
              : "bg-gray-100 text-gray-700 hover:bg-red-50 border-2 border-transparent hover:border-red-200"
          }
        `}
        title={status === "authenticated" ? "싫어요" : "로그인이 필요합니다"}
      >
        <span className="text-base">{userLike === false ? "👎" : "👎🏻"}</span>
        <span>{dislikeCount}</span>
      </button>
    </div>
  );
}

