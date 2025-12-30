import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    const body = await req.json();
    const { reason, description, reporterName, reporterEmail } = body;

    // 유효성 검사
    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "신고 사유를 선택해주세요." },
        { status: 400 }
      );
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

    // 신고 생성
    const report = await prisma.reviewReport.create({
      data: {
        reviewId: reviewIdNum,
        reason: reason.trim(),
        description: description?.trim() || undefined,
        reporterName: reporterName?.trim() || undefined,
        reporterEmail: reporterEmail?.trim() || undefined,
      },
    });

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: any) {
    console.error("리뷰 신고 오류:", error);
    return NextResponse.json(
      { error: error.message || "리뷰 신고에 실패했습니다." },
      { status: 500 }
    );
  }
}

