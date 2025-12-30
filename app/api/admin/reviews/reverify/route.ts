import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { reVerifyAllReviews } from "@/lib/review-verification";

/**
 * 모든 리뷰 재검증 (관리자 전용)
 * POST /api/admin/reviews/reverify
 */
export async function POST(req: Request) {
  try {
    // 관리자 권한 확인
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const result = await reVerifyAllReviews();

    return NextResponse.json({
      success: true,
      message: "모든 리뷰가 재검증되었습니다.",
      result,
    });
  } catch (error: any) {
    console.error("리뷰 재검증 오류:", error);
    return NextResponse.json(
      { error: error.message || "재검증 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

