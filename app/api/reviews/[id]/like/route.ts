import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

/**
 * 리뷰 좋아요/싫어요 추가 또는 변경
 * POST /api/reviews/[id]/like
 * Body: { isLike: boolean }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 로그인 확인
    const authResult = await requireAuth();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const userId = authResult.user!.id;
    const { id } = await params;
    const reviewId = Number(id);

    if (!Number.isFinite(reviewId)) {
      return NextResponse.json(
        { error: "유효하지 않은 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { isLike } = body;

    if (typeof isLike !== "boolean") {
      return NextResponse.json(
        { error: "isLike는 boolean 값이어야 합니다." },
        { status: 400 }
      );
    }

    // 리뷰 존재 확인
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 좋아요/싫어요 확인
    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    let result;
    let message;

    if (existingLike) {
      // 기존 값과 동일하면 삭제 (토글)
      if (existingLike.isLike === isLike) {
        await prisma.reviewLike.delete({
          where: { id: existingLike.id },
        });
        message = "좋아요/싫어요가 취소되었습니다.";
        result = null;
      } else {
        // 기존 값과 다르면 업데이트
        result = await prisma.reviewLike.update({
          where: { id: existingLike.id },
          data: { isLike },
        });
        message = isLike ? "좋아요로 변경되었습니다." : "싫어요로 변경되었습니다.";
      }
    } else {
      // 새로 생성
      result = await prisma.reviewLike.create({
        data: {
          reviewId,
          userId,
          isLike,
        },
      });
      message = isLike ? "좋아요가 추가되었습니다." : "싫어요가 추가되었습니다.";
    }

    // 리뷰의 좋아요/싫어요 수 업데이트
    const likeCount = await prisma.reviewLike.count({
      where: { reviewId, isLike: true },
    });
    const dislikeCount = await prisma.reviewLike.count({
      where: { reviewId, isLike: false },
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        likeCount,
        dislikeCount,
      },
    });

    return NextResponse.json({
      success: true,
      message,
      data: result,
      counts: { likeCount, dislikeCount },
    });
  } catch (error: any) {
    console.error("리뷰 좋아요/싫어요 처리 오류:", error);
    return NextResponse.json(
      { error: error.message || "처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 현재 사용자의 좋아요/싫어요 상태 조회
 * GET /api/reviews/[id]/like
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.authorized) {
      return NextResponse.json({ userLike: null });
    }

    const userId = authResult.user!.id;
    const { id } = await params;
    const reviewId = Number(id);

    if (!Number.isFinite(reviewId)) {
      return NextResponse.json(
        { error: "유효하지 않은 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    const userLike = await prisma.reviewLike.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    return NextResponse.json({
      userLike: userLike ? userLike.isLike : null,
    });
  } catch (error: any) {
    console.error("좋아요 상태 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

