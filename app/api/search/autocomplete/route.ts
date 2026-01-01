import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = query.trim();

    // 병원명으로 검색 (한국어, 영어 모두)
    const hospitals = await prisma.hospital.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { nameEn: { contains: searchTerm } },
          { address: { contains: searchTerm } },
          { city: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        address: true,
        city: true,
      },
      take: 8,
      orderBy: {
        reviewCount: "desc",
      },
    });

    const suggestions = hospitals.map((hospital) => ({
      id: hospital.id,
      text: hospital.name,
      subtext: hospital.address,
      type: "hospital" as const,
    }));

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("자동완성 검색 오류:", error);
    return NextResponse.json(
      { error: error.message || "자동완성 검색에 실패했습니다." },
      { status: 500 }
    );
  }
}

