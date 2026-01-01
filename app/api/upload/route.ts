import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 이미지 파일만 허용
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드할 수 있습니다. (JPEG, PNG, WebP, GIF)" },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기는 5MB를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 업로드 디렉토리 생성
    const uploadDir = join(process.cwd(), "public", "uploads", "reviews");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split(".").pop();
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const filepath = join(uploadDir, filename);

    // 파일 저장
    await writeFile(filepath, buffer);

    // URL 반환 (public 폴더 기준)
    const url = `/uploads/reviews/${filename}`;

    return NextResponse.json({ success: true, url }, { status: 200 });
  } catch (error: any) {
    console.error("파일 업로드 오류:", error);
    return NextResponse.json(
      { error: error.message || "파일 업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}

