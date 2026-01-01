import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: any = {
      isPublished: true,
    };

    if (category && category !== "all") {
      where.category = category;
    }

    const skip = (page - 1) * limit;

    const [articles, totalCount] = await prisma.$transaction([
      prisma.article.findMany({
        where,
        orderBy: [
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
        include: {
          tags: {
            take: 5,
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      articles,
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
    console.error("게시글 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "게시글 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

