import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const reviews = await prisma.review.findMany({
      where: { hospitalId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
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
    const { name, email, rating, title, content, language } = body;

    // 유효성 검사
    if (!name || !rating || !content) {
      return NextResponse.json(
        { error: "이름, 평점, 내용은 필수입니다." },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "평점은 1-5 사이여야 합니다." },
        { status: 400 }
      );
    }

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

    const review = await prisma.review.create({
      data: {
        hospitalId,
        name,
        email: email || undefined,
        rating,
        title: title || undefined,
        content,
        language: language || undefined,
      },
    });

    // 병원 평점 재계산
    const allReviews = await prisma.review.findMany({
      where: { hospitalId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // 소수점 첫째 자리까지
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

