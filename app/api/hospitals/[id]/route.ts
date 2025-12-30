import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospitalId = Number(id);

    if (!Number.isFinite(hospitalId)) {
      return NextResponse.json({ error: "Invalid hospital ID" }, { status: 400 });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: {
        departments: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!hospital) {
      return NextResponse.json({ error: "병원을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ hospital });
  } catch (error: any) {
    console.error("병원 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "병원 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

