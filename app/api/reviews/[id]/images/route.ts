import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 리뷰 이미지 조회
 * GET /api/reviews/[id]/images
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);

    if (!Number.isFinite(reviewId)) {
      return NextResponse.json(
        { error: "유효하지 않은 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    const images = await prisma.reviewImage.findMany({
      where: { reviewId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("리뷰 이미지 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 리뷰 이미지 추가
 * POST /api/reviews/[id]/images
 * Body: { imageUrl: string, caption?: string, order?: number }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);

    if (!Number.isFinite(reviewId)) {
      return NextResponse.json(
        { error: "유효하지 않은 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { imageUrl, caption, order } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl은 필수이며 문자열이어야 합니다." },
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

    // order가 지정되지 않은 경우 자동 할당
    let imageOrder = order;
    if (typeof imageOrder !== "number") {
      const maxOrder = await prisma.reviewImage.findFirst({
        where: { reviewId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      imageOrder = maxOrder ? maxOrder.order + 1 : 0;
    }

    const image = await prisma.reviewImage.create({
      data: {
        reviewId,
        imageUrl,
        caption: caption || undefined,
        order: imageOrder,
      },
    });

    return NextResponse.json({
      success: true,
      message: "이미지가 추가되었습니다.",
      image,
    });
  } catch (error: any) {
    console.error("리뷰 이미지 추가 오류:", error);
    return NextResponse.json(
      { error: error.message || "추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 리뷰 이미지 삭제
 * DELETE /api/reviews/[id]/images?imageId=123
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);
    const { searchParams } = new URL(req.url);
    const imageId = Number(searchParams.get("imageId"));

    if (!Number.isFinite(reviewId) || !Number.isFinite(imageId)) {
      return NextResponse.json(
        { error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    // 이미지 존재 및 소유권 확인
    const image = await prisma.reviewImage.findUnique({
      where: { id: imageId },
      include: { review: true },
    });

    if (!image || image.reviewId !== reviewId) {
      return NextResponse.json(
        { error: "이미지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    await prisma.reviewImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({
      success: true,
      message: "이미지가 삭제되었습니다.",
    });
  } catch (error: any) {
    console.error("리뷰 이미지 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

