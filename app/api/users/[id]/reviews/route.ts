import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const userId = Number(id);

    if (!session || session.user?.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
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
    console.error("리뷰 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "리뷰 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

