import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [qnas, totalCount] = await prisma.$transaction([
      prisma.qnA.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.qnA.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      qnas,
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
    console.error("Q&A 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "Q&A 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { title, content, category = "general" } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용은 필수입니다." },
        { status: 400 }
      );
    }

    const qna = await prisma.qnA.create({
      data: {
        title,
        content,
        category,
        userId: session?.user?.id ? Number(session.user.id) : null,
      },
    });

    return NextResponse.json({ success: true, qna }, { status: 201 });
  } catch (error: any) {
    console.error("Q&A 생성 오류:", error);
    return NextResponse.json(
      { error: error.message || "Q&A 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}

