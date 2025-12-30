import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

/**
 * 리뷰 검증 상태 변경 (관리자 전용)
 * PATCH /api/admin/reviews/[id]/verify
 * Body: { isVerified: boolean }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 권한 확인
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;
    const reviewId = Number(id);

    if (!Number.isFinite(reviewId)) {
      return NextResponse.json(
        { error: "유효하지 않은 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { isVerified } = body;

    if (typeof isVerified !== "boolean") {
      return NextResponse.json(
        { error: "isVerified는 boolean 값이어야 합니다." },
        { status: 400 }
      );
    }

    // 리뷰 존재 확인
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 검증 상태 업데이트
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { isVerified },
    });

    return NextResponse.json({
      success: true,
      message: isVerified
        ? "리뷰가 검증되었습니다."
        : "리뷰 검증이 취소되었습니다.",
      review: updatedReview,
    });
  } catch (error: any) {
    console.error("리뷰 검증 처리 오류:", error);
    return NextResponse.json(
      { error: error.message || "처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

