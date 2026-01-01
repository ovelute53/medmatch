import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ faqs });
  } catch (error: any) {
    console.error("FAQ 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "FAQ 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

