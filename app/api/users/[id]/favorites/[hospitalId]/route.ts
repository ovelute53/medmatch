import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnerOrAdmin } from "@/lib/api-auth";

// 즐겨찾기 제거
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; hospitalId: string }> }
) {
  try {
    const { id, hospitalId: hospitalIdStr } = await params;
    const userId = Number(id);
    const hospitalId = Number(hospitalIdStr);

    if (!Number.isFinite(userId) || !Number.isFinite(hospitalId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const authResult = await requireOwnerOrAdmin(userId);
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const favorite = await prisma.hospitalFavorite.findUnique({
      where: {
        userId_hospitalId: {
          userId,
          hospitalId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "즐겨찾기에 없는 병원입니다." },
        { status: 404 }
      );
    }

    await prisma.hospitalFavorite.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json({ success: true, message: "즐겨찾기에서 제거되었습니다." });
  } catch (error: any) {
    console.error("즐겨찾기 제거 오류:", error);
    return NextResponse.json(
      { error: error.message || "즐겨찾기 제거에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 즐겨찾기 상태 확인
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; hospitalId: string }> }
) {
  try {
    const { id, hospitalId: hospitalIdStr } = await params;
    const userId = Number(id);
    const hospitalId = Number(hospitalIdStr);

    if (!Number.isFinite(userId) || !Number.isFinite(hospitalId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const authResult = await requireOwnerOrAdmin(userId);
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const favorite = await prisma.hospitalFavorite.findUnique({
      where: {
        userId_hospitalId: {
          userId,
          hospitalId,
        },
      },
    });

    return NextResponse.json({ isFavorite: !!favorite });
  } catch (error: any) {
    console.error("즐겨찾기 상태 확인 오류:", error);
    return NextResponse.json(
      { error: error.message || "즐겨찾기 상태 확인에 실패했습니다." },
      { status: 500 }
    );
  }
}

