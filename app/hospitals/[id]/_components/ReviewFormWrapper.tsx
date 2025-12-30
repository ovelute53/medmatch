"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

interface ReviewFormWrapperProps {
  hospitalId: number;
}

export default function ReviewFormWrapper({ hospitalId }: ReviewFormWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleReviewSubmitted() {
    // 리뷰 목록 새로고침
    setRefreshKey((prev) => prev + 1);
    // 페이지 새로고침으로 평점 업데이트
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  return (
    <>
      <div key={refreshKey}>
        <ReviewList hospitalId={hospitalId} />
      </div>
      <div className="mt-6 border-t pt-6">
        <ReviewForm hospitalId={hospitalId} onReviewSubmitted={handleReviewSubmitted} />
      </div>
    </>
  );
}

