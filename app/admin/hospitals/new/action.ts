import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, phone } = body;

    const hospital = await prisma.hospital.create({
      data: {
        name,
        address,
        phone,
      },
    });

    return NextResponse.json({ success: true, hospital });
  } catch (error) {
    console.error("Error creating hospital:", error);
    return NextResponse.json(
      { success: false, message: "저장 중 오류 발생" },
      { status: 500 }
    );
  }
}
