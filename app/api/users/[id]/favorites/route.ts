import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnerOrAdmin } from "@/lib/api-auth";

// 사용자의 즐겨찾기 목록 조회
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const authResult = await requireOwnerOrAdmin(userId);
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const favorites = await prisma.hospitalFavorite.findMany({
      where: { userId },
      include: {
        hospital: {
          include: {
            departments: {
              include: {
                department: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error("즐겨찾기 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "즐겨찾기 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 즐겨찾기 추가
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const authResult = await requireOwnerOrAdmin(userId);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { hospitalId } = body;

    if (!hospitalId) {
      return NextResponse.json({ error: "Hospital ID is required" }, { status: 400 });
    }

    // 병원이 존재하는지 확인
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      return NextResponse.json({ error: "병원을 찾을 수 없습니다." }, { status: 404 });
    }

    // 이미 즐겨찾기에 추가되어 있는지 확인
    const existing = await prisma.hospitalFavorite.findUnique({
      where: {
        userId_hospitalId: {
          userId,
          hospitalId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 즐겨찾기에 추가된 병원입니다." },
        { status: 400 }
      );
    }

    const favorite = await prisma.hospitalFavorite.create({
      data: {
        userId,
        hospitalId,
      },
      include: {
        hospital: true,
      },
    });

    return NextResponse.json({ success: true, favorite }, { status: 201 });
  } catch (error: any) {
    console.error("즐겨찾기 추가 오류:", error);
    return NextResponse.json(
      { error: error.message || "즐겨찾기 추가에 실패했습니다." },
      { status: 500 }
    );
  }
}

