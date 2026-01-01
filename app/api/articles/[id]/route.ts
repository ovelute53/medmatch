import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = Number(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: "유효하지 않은 게시글 ID입니다." },
        { status: 400 }
      );
    }

    // 게시글 조회 및 조회수 증가
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
        isPublished: true, // 게시된 글만 조회
      },
      include: {
        tags: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 조회수 증가
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });

    // 조회수 증가된 값 반환
    const updatedArticle = {
      ...article,
      viewCount: article.viewCount + 1,
    };

    return NextResponse.json({ article: updatedArticle });
  } catch (error: any) {
    console.error("게시글 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "게시글 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

