import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("사용자 리뷰 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "사용자 리뷰를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

