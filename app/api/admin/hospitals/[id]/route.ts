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
      return NextResponse.json({ error: "Invalid hospital id" }, { status: 400 });
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospitalId = Number(id);
    if (!Number.isFinite(hospitalId)) {
      return NextResponse.json({ error: "Invalid hospital id" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      nameEn,
      address,
      city,
      country,
      phone,
      website,
      description,
      descriptionEn,
      imageUrl,
      rating,
      reviewCount,
      departmentIds,
    } = body;

    // 기존 병원 확인
    const existingHospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!existingHospital) {
      return NextResponse.json({ error: "병원을 찾을 수 없습니다." }, { status: 404 });
    }

    // 진료과 관계 업데이트
    if (departmentIds && Array.isArray(departmentIds)) {
      // 기존 관계 삭제
      await prisma.hospitalDepartment.deleteMany({
        where: { hospitalId },
      });

      // 새 관계 생성
      await prisma.hospitalDepartment.createMany({
        data: departmentIds.map((deptId: number) => ({
          hospitalId,
          departmentId: deptId,
        })),
      });
    }

    // 병원 정보 업데이트
    const updated = await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        ...(name && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(address && { address }),
        ...(city !== undefined && { city }),
        ...(country && { country }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(description !== undefined && { description }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(rating !== undefined && { rating }),
        ...(reviewCount !== undefined && { reviewCount }),
      },
      include: {
        departments: {
          include: {
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, hospital: updated });
  } catch (error: any) {
    console.error("병원 수정 오류:", error);
    return NextResponse.json(
      { error: error.message || "병원 수정에 실패했습니다." },
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
    const hospitalId = Number(id);
    if (!Number.isFinite(hospitalId)) {
      return NextResponse.json({ error: "Invalid hospital id" }, { status: 400 });
    }

    // 기존 병원 확인
    const existingHospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!existingHospital) {
      return NextResponse.json({ error: "병원을 찾을 수 없습니다." }, { status: 404 });
    }

    // 병원 삭제 (관계는 cascade로 자동 삭제됨)
    await prisma.hospital.delete({
      where: { id: hospitalId },
    });

    return NextResponse.json({ success: true, message: "병원이 삭제되었습니다." });
  } catch (error: any) {
    console.error("병원 삭제 오류:", error);
    return NextResponse.json(
      { error: error.message || "병원 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

