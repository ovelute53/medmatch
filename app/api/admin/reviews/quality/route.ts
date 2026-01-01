import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { calculateReviewQuality } from "@/lib/review-verification";
import { prisma } from "@/lib/prisma";

/**
 * 모든 리뷰의 품질 점수 조회 (관리자 전용)
 * GET /api/admin/reviews/quality
 */
export async function GET(req: Request) {
  try {
    // 관리자 권한 확인
    const authResult = await requireAdmin();
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const { searchParams } = new URL(req.url);
    const minScore = parseInt(searchParams.get("minScore") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // 모든 리뷰 조회
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        hospitalId: true,
        name: true,
        rating: true,
        content: true,
        title: true,
        isVerified: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // 각 리뷰의 품질 점수 계산
    const reviewsWithQuality = await Promise.all(
      reviews.map(async (review) => {
        const qualityScore = await calculateReviewQuality(review.id);
        return {
          ...review,
          qualityScore,
        };
      })
    );

    // 최소 점수 필터링
    const filteredReviews = reviewsWithQuality.filter(
      (r) => r.qualityScore >= minScore
    );

    // 품질 점수로 정렬
    filteredReviews.sort((a, b) => b.qualityScore - a.qualityScore);

    return NextResponse.json({
      reviews: filteredReviews,
      count: filteredReviews.length,
    });
  } catch (error: any) {
    console.error("리뷰 품질 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

