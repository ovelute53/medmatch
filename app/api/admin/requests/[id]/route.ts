import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = Number(params.id);
    if (!Number.isFinite(requestId)) {
      return NextResponse.json(
        { error: "Invalid request id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = ["new", "contacted", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { status },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    console.error("문의 상태 업데이트 오류:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "문의 상태 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = Number(params.id);
    if (!Number.isFinite(requestId)) {
      return NextResponse.json(
        { error: "Invalid request id" },
        { status: 400 }
      );
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ request });
  } catch (error: any) {
    console.error("문의 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "문의 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

