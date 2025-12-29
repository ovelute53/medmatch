import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HospitalsPage() {
  const hospitals = await prisma.hospital.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: "20px" }}>
      <h1>병원 목록</h1>

      {hospitals.length === 0 ? (
        <p>등록된 병원이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {hospitals.map((hospital) => (
            <li
              key={hospital.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                margin: "8px 0",
              }}
            >
              <Link href={`/hospitals/${hospital.id}`}>
                <h3 style={{ cursor: "pointer", color: "blue" }}>
                  {hospital.name}
                </h3>
              </Link>
              <p>📍 {hospital.address}</p>
              <p>📞 {hospital.phone}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
