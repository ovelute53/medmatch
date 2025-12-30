import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 리뷰 댓글 조회
 * GET /api/reviews/[id]/comments
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

    const comments = await prisma.reviewComment.findMany({
      where: { reviewId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("댓글 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 리뷰 댓글 작성
 * POST /api/reviews/[id]/comments
 * Body: { authorName: string, content: string, userId?: number, isHospitalReply?: boolean }
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
    const { authorName, content, userId, isHospitalReply } = body;

    if (!authorName || !content) {
      return NextResponse.json(
        { error: "작성자 이름과 내용은 필수입니다." },
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

    const comment = await prisma.reviewComment.create({
      data: {
        reviewId,
        userId: userId ? Number(userId) : undefined,
        authorName,
        content,
        isHospitalReply: isHospitalReply || false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // 리뷰의 댓글 수 업데이트
    const commentCount = await prisma.reviewComment.count({
      where: { reviewId },
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { commentCount },
    });

    return NextResponse.json({
      success: true,
      message: "댓글이 작성되었습니다.",
      comment,
    });
  } catch (error: any) {
    console.error("댓글 작성 오류:", error);
    return NextResponse.json(
      { error: error.message || "작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 리뷰 댓글 수정
 * PATCH /api/reviews/[id]/comments?commentId=123
 * Body: { content: string }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);
    const { searchParams } = new URL(req.url);
    const commentId = Number(searchParams.get("commentId"));

    if (!Number.isFinite(reviewId) || !Number.isFinite(commentId)) {
      return NextResponse.json(
        { error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "내용은 필수입니다." },
        { status: 400 }
      );
    }

    // 댓글 존재 확인
    const comment = await prisma.reviewComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.reviewId !== reviewId) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const updatedComment = await prisma.reviewComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "댓글이 수정되었습니다.",
      comment: updatedComment,
    });
  } catch (error: any) {
    console.error("댓글 수정 오류:", error);
    return NextResponse.json(
      { error: error.message || "수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 리뷰 댓글 삭제
 * DELETE /api/reviews/[id]/comments?commentId=123
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);
    const { searchParams } = new URL(req.url);
    const commentId = Number(searchParams.get("commentId"));

    if (!Number.isFinite(reviewId) || !Number.isFinite(commentId)) {
      return NextResponse.json(
        { error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    // 댓글 존재 확인
    const comment = await prisma.reviewComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.reviewId !== reviewId) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    await prisma.reviewComment.delete({
      where: { id: commentId },
    });

    // 리뷰의 댓글 수 업데이트
    const commentCount = await prisma.reviewComment.count({
      where: { reviewId },
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { commentCount },
    });

    return NextResponse.json({
      success: true,
      message: "댓글이 삭제되었습니다.",
    });
  } catch (error: any) {
    console.error("댓글 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

