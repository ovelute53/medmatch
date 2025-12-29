"use server";

import { prisma } from "@/lib/prisma";

export async function createHospital(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const address = String(formData.get("address") ?? "");
  const phone = String(formData.get("phone") ?? "");

  if (!name || !address) throw new Error("name, address는 필수입니다");

  await prisma.hospital.create({
    data: { name, address, phone: phone || null },
  });
}
