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
    const articleId = Number(id);

    if (!Number.isFinite(articleId)) {
      return NextResponse.json({ error: "Invalid Article ID" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        tags: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error: any) {
    console.error("Article 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "Article 조회에 실패했습니다." },
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
    const articleId = Number(id);

    if (!Number.isFinite(articleId)) {
      return NextResponse.json({ error: "Invalid Article ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      title,
      titleEn,
      content,
      contentEn,
      summary,
      summaryEn,
      category,
      imageUrl,
      author,
      tags,
      isPublished,
      publishedAt,
    } = body;

    // 기존 태그 삭제 후 새로 생성
    if (tags !== undefined) {
      await prisma.articleTag.deleteMany({
        where: { articleId },
      });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (titleEn !== undefined) updateData.titleEn = titleEn || null;
    if (content !== undefined) updateData.content = content;
    if (contentEn !== undefined) updateData.contentEn = contentEn || null;
    if (summary !== undefined) updateData.summary = summary || null;
    if (summaryEn !== undefined) updateData.summaryEn = summaryEn || null;
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (author !== undefined) updateData.author = author || null;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      // 게시로 변경될 때 publishedAt이 없으면 현재 시간 설정
      if (isPublished && !publishedAt) {
        updateData.publishedAt = new Date();
      } else if (!isPublished) {
        updateData.publishedAt = null;
      }
    }
    if (publishedAt !== undefined && publishedAt) {
      updateData.publishedAt = new Date(publishedAt);
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        ...updateData,
        ...(tags !== undefined && {
          tags: {
            create: tags.map((tag: string) => ({ tag })),
          },
        }),
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error("Article 수정 오류:", error);
    return NextResponse.json(
      { error: error.message || "Article 수정에 실패했습니다." },
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
    const articleId = Number(id);

    if (!Number.isFinite(articleId)) {
      return NextResponse.json({ error: "Invalid Article ID" }, { status: 400 });
    }

    // 태그 먼저 삭제 (Cascade로 자동 삭제되지만 명시적으로)
    await prisma.articleTag.deleteMany({
      where: { articleId },
    });

    await prisma.article.delete({
      where: { id: articleId },
    });

    return NextResponse.json({ success: true, message: "Article이 삭제되었습니다." });
  } catch (error: any) {
    console.error("Article 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "Article 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

