import { prisma } from "./prisma";

/**
 * 리뷰 자동 검증 로직
 * 
 * 다음 조건을 만족하면 자동으로 검증됨:
 * 1. 로그인한 사용자가 작성한 리뷰
 * 2. 리뷰 내용이 30자 이상
 * 3. 평점이 0.5 이상
 * 4. 스팸/욕설이 포함되지 않음
 */

const SPAM_KEYWORDS = [
  "광고",
  "홍보",
  "스팸",
  "돈벌기",
  "무료",
  "클릭",
  "링크",
  "사이트",
];

const PROFANITY_KEYWORDS = [
  "욕설1", // 실제 구현 시 적절한 필터링 필요
  "욕설2",
  // 더 많은 키워드 추가 가능
];

/**
 * 리뷰 내용에 스팸/욕설이 포함되어 있는지 확인
 */
function containsInappropriateContent(content: string, title?: string): boolean {
  const text = (content + " " + (title || "")).toLowerCase();

  // 스팸 키워드 확인
  for (const keyword of SPAM_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  // 욕설 키워드 확인
  for (const keyword of PROFANITY_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * 리뷰 자동 검증 여부 판단
 */
export function shouldAutoVerify(reviewData: {
  userId?: number | null;
  content: string;
  title?: string | null;
  rating: number;
}): boolean {
  // 1. 로그인한 사용자인지 확인
  if (!reviewData.userId) {
    return false;
  }

  // 2. 리뷰 내용이 30자 이상인지 확인
  if (reviewData.content.length < 30) {
    return false;
  }

  // 3. 평점이 0.5 이상인지 확인
  if (reviewData.rating < 0.5) {
    return false;
  }

  // 4. 스팸/욕설이 포함되지 않았는지 확인
  if (
    containsInappropriateContent(
      reviewData.content,
      reviewData.title || undefined
    )
  ) {
    return false;
  }

  return true;
}

/**
 * 기존 리뷰를 재검증 (관리자 도구)
 */
export async function reVerifyReview(reviewId: number): Promise<boolean> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("리뷰를 찾을 수 없습니다.");
  }

  const shouldVerify = shouldAutoVerify({
    userId: review.userId,
    content: review.content,
    title: review.title,
    rating: Number(review.rating),
  });

  if (shouldVerify !== review.isVerified) {
    await prisma.review.update({
      where: { id: reviewId },
      data: { isVerified: shouldVerify },
    });
  }

  return shouldVerify;
}

/**
 * 모든 리뷰를 재검증 (관리자 도구)
 */
export async function reVerifyAllReviews(): Promise<{
  total: number;
  verified: number;
  unverified: number;
}> {
  const reviews = await prisma.review.findMany({
    select: {
      id: true,
      userId: true,
      content: true,
      title: true,
      rating: true,
      isVerified: true,
    },
  });

  let verified = 0;
  let unverified = 0;

  for (const review of reviews) {
    const shouldVerify = shouldAutoVerify({
      userId: review.userId,
      content: review.content,
      title: review.title,
      rating: Number(review.rating),
    });

    if (shouldVerify !== review.isVerified) {
      await prisma.review.update({
        where: { id: review.id },
        data: { isVerified: shouldVerify },
      });
    }

    if (shouldVerify) {
      verified++;
    } else {
      unverified++;
    }
  }

  return {
    total: reviews.length,
    verified,
    unverified,
  };
}

/**
 * 리뷰 품질 점수 계산 (0-100)
 * 
 * 기준:
 * - 리뷰 길이: 30자 이상 (20점)
 * - 제목 포함: (10점)
 * - 로그인 사용자: (20점)
 * - 이미지 포함: (15점)
 * - 좋아요 수: (20점)
 * - 댓글 수: (15점)
 */
export async function calculateReviewQuality(reviewId: number): Promise<number> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      images: true,
    },
  });

  if (!review) {
    return 0;
  }

  let score = 0;

  // 리뷰 길이 (최대 20점)
  if (review.content.length >= 30) {
    score += 20;
  } else if (review.content.length >= 15) {
    score += 10;
  }

  // 제목 포함 (10점)
  if (review.title && review.title.length > 0) {
    score += 10;
  }

  // 로그인 사용자 (20점)
  if (review.userId) {
    score += 20;
  }

  // 이미지 포함 (최대 15점)
  const imageCount = review.images.length;
  if (imageCount >= 3) {
    score += 15;
  } else if (imageCount >= 1) {
    score += 10;
  }

  // 좋아요 수 (최대 20점)
  if (review.likeCount >= 10) {
    score += 20;
  } else if (review.likeCount >= 5) {
    score += 15;
  } else if (review.likeCount >= 1) {
    score += 10;
  }

  // 댓글 수 (최대 15점)
  if (review.commentCount >= 5) {
    score += 15;
  } else if (review.commentCount >= 1) {
    score += 10;
  }

  return Math.min(score, 100);
}

