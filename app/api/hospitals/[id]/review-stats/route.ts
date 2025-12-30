import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 병원 리뷰 통계 조회
 * GET /api/hospitals/[id]/review-stats
 * 
 * 반환 데이터:
 * - totalReviews: 전체 리뷰 수
 * - averageRating: 평균 평점
 * - ratingDistribution: 평점 분포 (0.5점 단위)
 * - verifiedReviews: 검증된 리뷰 수
 * - recentReviews: 최근 리뷰 (5개)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospitalId = Number(id);

    if (!Number.isFinite(hospitalId)) {
      return NextResponse.json(
        { error: "유효하지 않은 병원 ID입니다." },
        { status: 400 }
      );
    }

    // 병원 존재 확인
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: {
        id: true,
        name: true,
        rating: true,
        reviewCount: true,
      },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "병원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 전체 리뷰 조회
    const reviews = await prisma.review.findMany({
      where: { hospitalId },
      select: {
        rating: true,
        isVerified: true,
        createdAt: true,
        likeCount: true,
        commentCount: true,
      },
    });

    const totalReviews = reviews.length;
    const verifiedReviews = reviews.filter((r) => r.isVerified).length;

    // 평균 평점 계산
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / totalReviews
        : 0;

    // 평점 분포 계산 (0.5점 단위)
    const ratingDistribution: { [key: string]: number } = {
      "5.0": 0,
      "4.5": 0,
      "4.0": 0,
      "3.5": 0,
      "3.0": 0,
      "2.5": 0,
      "2.0": 0,
      "1.5": 0,
      "1.0": 0,
      "0.5": 0,
    };

    reviews.forEach((review) => {
      const rating = Number(review.rating).toFixed(1);
      if (ratingDistribution.hasOwnProperty(rating)) {
        ratingDistribution[rating]++;
      }
    });

    // 퍼센트로 변환
    const ratingPercentages: { [key: string]: number } = {};
    Object.keys(ratingDistribution).forEach((rating) => {
      ratingPercentages[rating] =
        totalReviews > 0
          ? Math.round((ratingDistribution[rating] / totalReviews) * 100)
          : 0;
    });

    // 최근 리뷰 5개
    const recentReviews = await prisma.review.findMany({
      where: { hospitalId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
        likeCount: true,
        commentCount: true,
        isVerified: true,
      },
    });

    // 월별 리뷰 수 (최근 6개월)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const reviewsByMonth = await prisma.review.groupBy({
      by: ["createdAt"],
      where: {
        hospitalId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    // 월별로 그룹화
    const monthlyStats: { [key: string]: number } = {};
    reviewsByMonth.forEach((item) => {
      const month = new Date(item.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyStats[month] = (monthlyStats[month] || 0) + item._count;
    });

    return NextResponse.json({
      hospital: {
        id: hospital.id,
        name: hospital.name,
      },
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        verifiedReviews,
        verificationRate:
          totalReviews > 0
            ? Math.round((verifiedReviews / totalReviews) * 100)
            : 0,
      },
      ratingDistribution: {
        counts: ratingDistribution,
        percentages: ratingPercentages,
      },
      monthlyStats,
      recentReviews,
    });
  } catch (error: any) {
    console.error("리뷰 통계 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

