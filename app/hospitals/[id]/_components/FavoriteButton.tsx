"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  hospitalId: number;
}

export default function FavoriteButton({ hospitalId }: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      checkFavoriteStatus();
    }
  }, [status, session, hospitalId]);

  async function checkFavoriteStatus() {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/users/${session.user.id}/favorites/${hospitalId}`);
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error("즐겨찾기 상태 확인 실패:", error);
    }
  }

  async function toggleFavorite() {
    if (status !== "authenticated") {
      router.push("/auth/signin");
      return;
    }

    if (!session?.user?.id) return;

    setLoading(true);
    try {
      if (isFavorite) {
        // 제거
        const res = await fetch(`/api/users/${session.user.id}/favorites/${hospitalId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setIsFavorite(false);
        } else {
          const data = await res.json();
          alert(data.error || "즐겨찾기 제거에 실패했습니다.");
        }
      } else {
        // 추가
        const res = await fetch(`/api/users/${session.user.id}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hospitalId }),
        });

        if (res.ok) {
          setIsFavorite(true);
        } else {
          const data = await res.json();
          alert(data.error || "즐겨찾기 추가에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("즐겨찾기 토글 실패:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200
        ${
          isFavorite
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            : "bg-white text-gray-700 border-2 border-gray-200 hover:border-red-400 hover:text-red-600 hover:bg-red-50"
        }
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:hover:bg-white
      `}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {loading ? "처리 중..." : isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
    </button>
  );
}

