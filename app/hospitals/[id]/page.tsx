import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HospitalDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const hospitalId = Number(id); // ✅ 핵심

  if (Number.isNaN(hospitalId)) notFound();

  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
  });

  if (!hospital) notFound();

  return (
    <main style={{ padding: 20 }}>
      <h1>병원 상세</h1>
      <h2>{hospital.name}</h2>
      <p>📍 {hospital.address}</p>
      <p>📞 {hospital.phone ?? "-"}</p>
    </main>
  );
}
