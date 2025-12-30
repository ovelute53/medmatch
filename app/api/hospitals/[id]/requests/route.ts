import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hospitalId = Number(params.id);
    if (!Number.isFinite(hospitalId)) {
      return NextResponse.json({ message: "Invalid hospital id" }, { status: 400 });
    }

    const body = await req.json();
    const { type, name, phone, message, preferredAt } = body;

    if (!type || !name || !phone) {
      return NextResponse.json({ message: "필수값 누락" }, { status: 400 });
    }

    const created = await prisma.request.create({
      data: {
        hospitalId,
        type,
        name,
        phone,
        message: message || null,
        preferredAt: preferredAt ? new Date(preferredAt) : null,
      },
    });

    return NextResponse.json({ success: true, request: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
