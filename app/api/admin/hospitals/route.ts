import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      nameEn,
      address,
      city,
      country = "Korea",
      phone,
      website,
      description,
      descriptionEn,
      imageUrl,
      departmentIds = [],
    } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: "병원명과 주소는 필수입니다." },
        { status: 400 }
      );
    }

    const hospital = await prisma.hospital.create({
      data: {
        name,
        nameEn: nameEn || null,
        address,
        city: city || null,
        country,
        phone: phone || null,
        website: website || null,
        description: description || null,
        descriptionEn: descriptionEn || null,
        imageUrl: imageUrl || null,
        departments: {
          create: departmentIds.map((deptId: number) => ({
            departmentId: deptId,
          })),
        },
      },
      include: {
        departments: {
          include: {
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, hospital }, { status: 201 });
  } catch (error: any) {
    console.error("병원 생성 오류:", error);
    return NextResponse.json(
      { error: error.message || "병원 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

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
