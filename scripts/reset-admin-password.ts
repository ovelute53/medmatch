import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL이 설정되지 않았습니다.");
  process.exit(1);
}

const adapter = new PrismaLibSql({
  url: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function resetAdminPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("사용법: npm run reset-admin-password <email> <new-password>");
    console.error("예시: npm run reset-admin-password admin@medmatch.com newpass123");
    process.exit(1);
  }

  try {
    // 관리자 계정 확인
    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin) {
      console.error(`❌ 해당 이메일을 가진 사용자를 찾을 수 없습니다: ${email}`);
      process.exit(1);
    }

    if (admin.role !== "admin") {
      console.error(`❌ ${email}은(는) 관리자 계정이 아닙니다.`);
      process.exit(1);
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log("✅ 관리자 비밀번호가 성공적으로 재설정되었습니다!");
    console.log("=".repeat(50));
    console.log(`이메일: ${email}`);
    console.log(`새 비밀번호: ${newPassword}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ 비밀번호 재설정 중 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

