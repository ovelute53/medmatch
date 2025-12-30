import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const where: any = {};

    if (departmentId) {
      where.departments = {
        some: {
          departmentId: Number(departmentId),
        },
      };
    }

    if (city) {
      where.city = city;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameEn: { contains: search } },
        { address: { contains: search } },
        { description: { contains: search } },
        { descriptionEn: { contains: search } },
      ];
    }

    const hospitals = await prisma.hospital.findMany({
      where,
      include: {
        departments: {
          include: {
            department: true,
          },
        },
      },
      orderBy: [
        { rating: "desc" },
        { reviewCount: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ hospitals });
  } catch (error: any) {
    console.error("병원 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "병원 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

