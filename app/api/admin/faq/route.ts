import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }

    const skip = (page - 1) * limit;

    const [faqs, totalCount] = await prisma.$transaction([
      prisma.fAQ.findMany({
        where,
        orderBy: [
          { order: "asc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.fAQ.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      faqs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("FAQ 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "FAQ 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const body = await req.json();
    const {
      question,
      questionEn,
      answer,
      answerEn,
      category = "general",
      order = 0,
    } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "질문과 답변은 필수입니다." },
        { status: 400 }
      );
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        questionEn: questionEn || null,
        answer,
        answerEn: answerEn || null,
        category,
        order: order || 0,
      },
    });

    return NextResponse.json({ success: true, faq }, { status: 201 });
  } catch (error: any) {
    console.error("FAQ 생성 오류:", error);
    return NextResponse.json(
      { error: error.message || "FAQ 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

