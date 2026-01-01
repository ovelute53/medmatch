import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const qnaId = Number(id);

    if (!Number.isFinite(qnaId)) {
      return NextResponse.json({ error: "Invalid Q&A ID" }, { status: 400 });
    }

    // 조회수 증가
    await prisma.qnA.update({
      where: { id: qnaId },
      data: { viewCount: { increment: 1 } },
    });

    const qna = await prisma.qnA.findUnique({
      where: { id: qnaId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!qna) {
      return NextResponse.json({ error: "Q&A를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ qna });
  } catch (error: any) {
    console.error("Q&A 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "Q&A 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

