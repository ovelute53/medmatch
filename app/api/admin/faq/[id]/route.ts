import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const { id } = await params;
    const faqId = Number(id);

    if (!Number.isFinite(faqId)) {
      return NextResponse.json({ error: "Invalid FAQ ID" }, { status: 400 });
    }

    const faq = await prisma.fAQ.findUnique({
      where: { id: faqId },
    });

    if (!faq) {
      return NextResponse.json({ error: "FAQ를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ faq });
  } catch (error: any) {
    console.error("FAQ 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "FAQ 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

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
    const faqId = Number(id);

    if (!Number.isFinite(faqId)) {
      return NextResponse.json({ error: "Invalid FAQ ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      question,
      questionEn,
      answer,
      answerEn,
      category,
      order,
    } = body;

    const updateData: any = {};
    if (question !== undefined) updateData.question = question;
    if (questionEn !== undefined) updateData.questionEn = questionEn || null;
    if (answer !== undefined) updateData.answer = answer;
    if (answerEn !== undefined) updateData.answerEn = answerEn || null;
    if (category !== undefined) updateData.category = category;
    if (order !== undefined) updateData.order = order;

    const faq = await prisma.fAQ.update({
      where: { id: faqId },
      data: updateData,
    });

    return NextResponse.json({ success: true, faq });
  } catch (error: any) {
    console.error("FAQ 수정 오류:", error);
    return NextResponse.json(
      { error: error.message || "FAQ 수정에 실패했습니다." },
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
    const faqId = Number(id);

    if (!Number.isFinite(faqId)) {
      return NextResponse.json({ error: "Invalid FAQ ID" }, { status: 400 });
    }

    await prisma.fAQ.delete({
      where: { id: faqId },
    });

    return NextResponse.json({ success: true, message: "FAQ가 삭제되었습니다." });
  } catch (error: any) {
    console.error("FAQ 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "FAQ 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

