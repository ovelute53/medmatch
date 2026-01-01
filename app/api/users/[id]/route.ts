import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnerOrAdmin } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // 권한 확인: 본인 또는 관리자만 조회 가능
    const authResult = await requireOwnerOrAdmin(userId);
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("사용자 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "사용자 조회에 실패했습니다." },
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
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // 권한 확인: 본인 또는 관리자만 수정 가능
    const authResult = await requireOwnerOrAdmin(userId);
    if (!authResult.authorized && authResult.response) {
      return authResult.response;
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword, image } = body;

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined && email !== user.email) {
      // 이메일 중복 확인
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "이미 사용 중인 이메일입니다." },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    // 비밀번호 변경
    if (newPassword) {
      if (!user.password) {
        return NextResponse.json(
          { error: "소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다." },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { error: "현재 비밀번호를 입력해주세요." },
          { status: 400 }
        );
      }

      // 현재 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "현재 비밀번호가 일치하지 않습니다." },
          { status: 400 }
        );
      }

      // 새 비밀번호 해시
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // 업데이트 실행
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: "프로필이 업데이트되었습니다."
    });
  } catch (error: any) {
    console.error("프로필 업데이트 오류:", error);
    return NextResponse.json(
      { error: error.message || "프로필 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}

