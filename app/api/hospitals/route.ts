import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const departmentIds = searchParams.getAll("departmentIds"); // 여러 진료과 선택
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

    // 여러 진료과 선택 (departmentIds가 우선)
    if (departmentIds.length > 0) {
      const ids = departmentIds.map(id => Number(id)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        where.departments = {
          some: {
            departmentId: { in: ids },
          },
        };
      }
    } else if (departmentId) {
      // 하위 호환성을 위해 단일 departmentId도 지원
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
      const ratingConditions: any = {
        not: null, // 평점이 null이 아닌 경우만
      };
      if (minRating) {
        ratingConditions.gte = parseFloat(minRating);
      }
      if (maxRating) {
        ratingConditions.lte = parseFloat(maxRating);
      }
      where.rating = ratingConditions;
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

