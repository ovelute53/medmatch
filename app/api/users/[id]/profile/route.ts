import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    // 본인 프로필만 조회 가능 (타입 변환)
    const authUserId = typeof authResult.user.id === 'string' ? Number(authResult.user.id) : authResult.user.id;
    if (authUserId !== userId) {
      return NextResponse.json(
        { error: "본인 프로필만 조회할 수 있습니다." },
        { status: 403 }
      );
    }

    // 사용자 정보
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 통계 정보
    const [reviewCount, favoriteCount, qnaCount] = await prisma.$transaction([
      prisma.review.count({ where: { userId } }),
      prisma.hospitalFavorite.count({ where: { userId } }),
      prisma.qnA.count({ where: { userId } }),
    ]);

    // 작성한 리뷰 목록 (최근 5개)
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 즐겨찾기 목록 (최근 5개)
    const favorites = await prisma.hospitalFavorite.findMany({
      where: { userId },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            imageUrl: true,
            rating: true,
            reviewCount: true,
            address: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 작성한 Q&A 목록 (최근 5개)
    const qnas = await prisma.qnA.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      user,
      stats: {
        reviewCount,
        favoriteCount,
        qnaCount,
      },
      recentReviews: reviews,
      recentFavorites: favorites.map((f) => f.hospital),
      recentQnAs: qnas,
    });
  } catch (error: any) {
    console.error("프로필 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "프로필 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

