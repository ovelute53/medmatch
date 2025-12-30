import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("문의 내역 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "문의 내역 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

