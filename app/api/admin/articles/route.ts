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
    const isPublished = searchParams.get("isPublished");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }
    if (isPublished !== null && isPublished !== undefined) {
      where.isPublished = isPublished === "true";
    }

    const skip = (page - 1) * limit;

    const [articles, totalCount] = await prisma.$transaction([
      prisma.article.findMany({
        where,
        include: {
          tags: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
    console.error("Article 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "Article 조회에 실패했습니다." },
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
      title,
      titleEn,
      content,
      contentEn,
      summary,
      summaryEn,
      category = "general",
      imageUrl,
      author,
      tags = [],
      isPublished = false,
      publishedAt,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 본문은 필수입니다." },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        titleEn: titleEn || null,
        content,
        contentEn: contentEn || null,
        summary: summary || null,
        summaryEn: summaryEn || null,
        category,
        imageUrl: imageUrl || null,
        author: author || null,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : (isPublished ? new Date() : null),
        tags: {
          create: tags.map((tag: string) => ({ tag })),
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (error: any) {
    console.error("Article 생성 오류:", error);
    return NextResponse.json(
      { error: error.message || "Article 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

