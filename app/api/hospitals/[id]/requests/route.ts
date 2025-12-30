import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospitalId = Number(id);
    if (!Number.isFinite(hospitalId)) {
      return NextResponse.json({ message: "Invalid hospital id" }, { status: 400 });
    }

    const body = await req.json();
    const { type, name, phone, email, language, message, preferredAt } = body;

    if (!type || !name || !phone) {
      return NextResponse.json({ message: "필수값 누락" }, { status: 400 });
    }

    const created = await prisma.request.create({
      data: {
        hospitalId,
        type,
        name,
        phone,
        email: email || undefined,
        language: language || undefined,
        message: message || undefined,
        preferredAt: preferredAt ? new Date(preferredAt) : undefined,
      },
    });

    return NextResponse.json({ success: true, request: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
