import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldAutoVerify } from "@/lib/review-verification";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospitalId = Number(id);

    if (!Number.isFinite(hospitalId)) {
      return NextResponse.json({ error: "Invalid hospital id" }, { status: 400 });
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "latest"; // latest, ratingHigh, ratingLow, oldest
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // 정렬 옵션 설정
    let orderBy: { createdAt?: "asc" | "desc"; rating?: "asc" | "desc" } = {};
    switch (sortBy) {
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "ratingHigh":
        orderBy = { rating: "desc" };
        break;
      case "ratingLow":
        orderBy = { rating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // 전체 리뷰 수 조회
    const totalCount = await prisma.review.count({
      where: { hospitalId },
    });

    // 리뷰 조회 (페이지네이션 적용)
    const reviews = await prisma.review.findMany({
      where: { hospitalId },
      orderBy,
      skip,
      take: limit,
    });

    // rating 값을 명시적으로 Number로 변환하여 JSON 직렬화 시 Float가 제대로 전달되도록 함
    const reviewsWithNumericRating = reviews.map((review) => ({
      ...review,
      rating: Number(review.rating),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      reviews: reviewsWithNumericRating,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("리뷰 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "리뷰 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospitalId = Number(id);

    if (!Number.isFinite(hospitalId)) {
      return NextResponse.json({ error: "Invalid hospital id" }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, rating, title, content, language, userId } = body;

    // 유효성 검사
    if (!name || !rating || !content) {
      return NextResponse.json(
        { error: "이름, 평점, 내용은 필수입니다." },
        { status: 400 }
      );
    }

    if (rating < 0.5 || rating > 5) {
      return NextResponse.json(
        { error: "평점은 0.5-5 사이여야 합니다." },
        { status: 400 }
      );
    }

    // 0.5 단위로 반올림
    const roundedRating = Math.round(rating * 2) / 2;

    // 병원 존재 확인
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      return NextResponse.json({ error: "병원을 찾을 수 없습니다." }, { status: 404 });
    }

    // 리뷰 생성
    if (!prisma.review) {
      console.error("Prisma Client에 review 모델이 없습니다. 개발 서버를 재시작해주세요.");
      return NextResponse.json(
        { error: "서버 설정 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    // 자동 검증 여부 확인
    const isVerified = shouldAutoVerify({
      userId: userId ? Number(userId) : undefined,
      content,
      title,
      rating: roundedRating,
    });

    const review = await prisma.review.create({
      data: {
        hospitalId,
        userId: userId ? Number(userId) : undefined,
        name,
        email: email || undefined,
        rating: roundedRating,
        title: title || undefined,
        content,
        language: language || undefined,
        isVerified,
      },
    });

    // 병원 평점 재계산
    const allReviews = await prisma.review.findMany({
      where: { hospitalId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / allReviews.length
        : 0;

    await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        rating: allReviews.length > 0 ? Math.round(averageRating * 10) / 10 : null,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error("리뷰 작성 오류:", error);
    return NextResponse.json(
      { error: error.message || "리뷰 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}

