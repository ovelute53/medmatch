import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = Number(id);

    if (!Number.isFinite(reportId)) {
      return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
    }

    const body = await req.json();
    const { status, adminNote } = body;

    if (!status || !["pending", "reviewed", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json(
        { error: "유효한 상태값이 필요합니다." },
        { status: 400 }
      );
    }

    const report = await prisma.reviewReport.update({
      where: { id: reportId },
      data: {
        status,
        adminNote: adminNote || undefined,
      },
      include: {
        review: {
          include: {
            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("신고 상태 업데이트 오류:", error);
    return NextResponse.json(
      { error: error.message || "신고 상태 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = Number(id);

    if (!Number.isFinite(reportId)) {
      return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
    }

    await prisma.reviewReport.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ success: true, message: "신고가 삭제되었습니다." });
  } catch (error: any) {
    console.error("신고 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "신고 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

