import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const { id } = await params;
    const qnaId = Number(id);

    if (!Number.isFinite(qnaId)) {
      return NextResponse.json({ error: "Invalid Q&A ID" }, { status: 400 });
    }

    const body = await req.json();
    const { answer, answeredBy } = body;

    if (!answer || !answer.trim()) {
      return NextResponse.json(
        { error: "답변 내용은 필수입니다." },
        { status: 400 }
      );
    }

    const qna = await prisma.qnA.update({
      where: { id: qnaId },
      data: {
        answer: answer.trim(),
        answeredBy: answeredBy || authResult.user?.name || "관리자",
        answeredAt: new Date(),
        status: "answered",
      },
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

    return NextResponse.json({ success: true, qna });
  } catch (error: any) {
    console.error("Q&A 답변 작성 오류:", error);
    return NextResponse.json(
      { error: error.message || "답변 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const { id } = await params;
    const qnaId = Number(id);

    if (!Number.isFinite(qnaId)) {
      return NextResponse.json({ error: "Invalid Q&A ID" }, { status: 400 });
    }

    const qna = await prisma.qnA.update({
      where: { id: qnaId },
      data: {
        answer: null,
        answeredBy: null,
        answeredAt: null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, qna });
  } catch (error: any) {
    console.error("Q&A 답변 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "답변 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

