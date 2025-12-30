import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = Number(params.id);
    if (!Number.isFinite(departmentId)) {
      return NextResponse.json({ error: "Invalid department id" }, { status: 400 });
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      return NextResponse.json({ error: "진료과를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ department });
  } catch (error: any) {
    console.error("진료과 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "진료과 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = Number(params.id);
    if (!Number.isFinite(departmentId)) {
      return NextResponse.json({ error: "Invalid department id" }, { status: 400 });
    }

    const body = await req.json();
    const { name, nameEn, icon, description } = body;

    const existingDepartment = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!existingDepartment) {
      return NextResponse.json({ error: "진료과를 찾을 수 없습니다." }, { status: 404 });
    }

    const updated = await prisma.department.update({
      where: { id: departmentId },
      data: {
        ...(name && { name }),
        ...(nameEn && { nameEn }),
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ success: true, department: updated });
  } catch (error: any) {
    console.error("진료과 수정 오류:", error);
    return NextResponse.json(
      { error: error.message || "진료과 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = Number(params.id);
    if (!Number.isFinite(departmentId)) {
      return NextResponse.json({ error: "Invalid department id" }, { status: 400 });
    }

    const existingDepartment = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!existingDepartment) {
      return NextResponse.json({ error: "진료과를 찾을 수 없습니다." }, { status: 404 });
    }

    // 관련 병원이 있는지 확인
    const hospitalsWithDepartment = await prisma.hospitalDepartment.findFirst({
      where: { departmentId },
    });

    if (hospitalsWithDepartment) {
      return NextResponse.json(
        { error: "이 진료과를 사용하는 병원이 있어 삭제할 수 없습니다." },
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id: departmentId },
    });

    return NextResponse.json({ success: true, message: "진료과가 삭제되었습니다." });
  } catch (error: any) {
    console.error("진료과 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "진료과 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

