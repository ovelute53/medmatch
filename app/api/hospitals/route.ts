import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "rating"; // rating, reviewCount, name, createdAt
    const sortOrder = searchParams.get("sortOrder") || "desc"; // asc, desc
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");
    const minReviewCount = searchParams.get("minReviewCount");

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

    // 평점 범위 필터
    if (minRating || maxRating) {
      where.rating = {};
      // 평점이 null이 아닌 경우만 필터링
      if (minRating || maxRating) {
        where.rating.not = null;
      }
      if (minRating) {
        where.rating.gte = parseFloat(minRating);
      }
      if (maxRating) {
        where.rating.lte = parseFloat(maxRating);
      }
    }

    // 최소 리뷰 수 필터
    if (minReviewCount) {
      where.reviewCount = {
        gte: parseInt(minReviewCount),
      };
    }

    // 정렬 옵션 (Prisma는 배열을 요구합니다)
    let orderBy: any[] = [];
    switch (sortBy) {
      case "rating":
        orderBy = [
          { rating: sortOrder },
          { reviewCount: "desc" }, // 평점이 같으면 리뷰 수로
        ];
        break;
      case "reviewCount":
        orderBy = [
          { reviewCount: sortOrder },
          { rating: "desc" }, // 리뷰 수가 같으면 평점으로
        ];
        break;
      case "name":
        orderBy = [{ name: sortOrder }];
        break;
      case "createdAt":
        orderBy = [{ createdAt: sortOrder }];
        break;
      default:
        orderBy = [
          { rating: "desc" },
          { reviewCount: "desc" },
        ];
    }

    // 전체 개수 조회
    const totalCount = await prisma.hospital.count({ where });

    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // 병원 데이터 조회
    const hospitals = await prisma.hospital.findMany({
      where,
      include: {
        departments: {
          include: {
            department: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return NextResponse.json({
      hospitals,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("병원 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "병원 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

