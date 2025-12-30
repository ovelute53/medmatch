import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ departments });
  } catch (error: any) {
    console.error("진료과 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "진료과 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, nameEn, icon, description } = body;

    if (!name || !nameEn) {
      return NextResponse.json(
        { error: "진료과명(한국어, 영어)은 필수입니다." },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        nameEn,
        icon: icon || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, department }, { status: 201 });
  } catch (error: any) {
    console.error("진료과 생성 오류:", error);
    return NextResponse.json(
      { error: error.message || "진료과 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

