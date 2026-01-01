import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnerOrAdmin } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);

    if (!Number.isFinite(reviewId)) {
      return NextResponse.json({ error: "Invalid Review ID" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error("리뷰 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "리뷰 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);

    if (!Number.isFinite(reviewId)) {
      return NextResponse.json({ error: "Invalid Review ID" }, { status: 400 });
    }

    // 리뷰 소유자 또는 관리자만 수정 가능
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
    }

    const authResult = await requireOwnerOrAdmin(review.userId || 0);
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const body = await req.json();
    const { rating, title, content, language } = body;

    const updateData: any = {};
    if (rating !== undefined) {
      if (rating < 0.5 || rating > 5) {
        return NextResponse.json(
          { error: "평점은 0.5-5 사이여야 합니다." },
          { status: 400 }
        );
      }
      updateData.rating = Math.round(rating * 2) / 2;
    }
    if (title !== undefined) updateData.title = title || null;
    if (content !== undefined) updateData.content = content;
    if (language !== undefined) updateData.language = language || null;

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // 병원 평점 재계산
    if (rating !== undefined) {
      const allReviews = await prisma.review.findMany({
        where: { hospitalId: review.hospitalId },
        select: { rating: true },
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await prisma.hospital.update({
        where: { id: review.hospitalId },
        data: { rating: Math.round(avgRating * 10) / 10 },
      });
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: "리뷰가 수정되었습니다.",
    });
  } catch (error: any) {
    console.error("리뷰 수정 오류:", error);
    return NextResponse.json(
      { error: error.message || "리뷰 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);

    if (!Number.isFinite(reviewId)) {
      return NextResponse.json({ error: "Invalid Review ID" }, { status: 400 });
    }

    // 리뷰 소유자 또는 관리자만 삭제 가능
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
    }

    const authResult = await requireOwnerOrAdmin(review.userId || 0);
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const hospitalId = review.hospitalId;

    // 리뷰 삭제 (Cascade로 관련 데이터 자동 삭제)
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // 병원 평점 재계산
    const allReviews = await prisma.review.findMany({
      where: { hospitalId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : null;

    await prisma.hospital.update({
      where: { id: hospitalId },
      data: { rating: avgRating ? Math.round(avgRating * 10) / 10 : null },
    });

    return NextResponse.json({
      success: true,
      message: "리뷰가 삭제되었습니다.",
    });
  } catch (error: any) {
    console.error("리뷰 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "리뷰 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

