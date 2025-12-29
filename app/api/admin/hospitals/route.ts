import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // TODO: 여기서 Prisma로 DB 저장할 예정 (다음 단계에서 연결)
    // 지금은 동작 확인용으로 그대로 응답만 돌려줌
    return NextResponse.json({ ok: true, received: body }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
