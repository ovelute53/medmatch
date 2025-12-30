import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id, reviewId } = await params;
    const hospitalId = Number(id);
    const reviewIdNum = Number(reviewId);

    if (!Number.isFinite(hospitalId) || !Number.isFinite(reviewIdNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // 리뷰 존재 확인
    const review = await prisma.review.findUnique({
      where: { id: reviewIdNum },
    });

    if (!review) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
    }

    if (review.hospitalId !== hospitalId) {
      return NextResponse.json(
        { error: "리뷰가 해당 병원에 속하지 않습니다." },
        { status: 400 }
      );
    }

    // 리뷰 삭제
    await prisma.review.delete({
      where: { id: reviewIdNum },
    });

    // 병원 평점 재계산
    const allReviews = await prisma.review.findMany({
      where: { hospitalId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        rating: allReviews.length > 0 ? Math.round(averageRating * 10) / 10 : null,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, message: "리뷰가 삭제되었습니다." });
  } catch (error: any) {
    console.error("리뷰 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "리뷰 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

