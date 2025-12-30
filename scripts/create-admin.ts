import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin";

  if (!email || !password) {
    console.error("사용법: npm run create-admin <email> <password> [name]");
    console.error("예시: npm run create-admin admin@example.com password123 관리자");
    process.exit(1);
  }

  try {
    // 기존 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`이미 존재하는 이메일입니다: ${email}`);
      if (existingUser.role === "admin") {
        console.log("이미 관리자 권한이 있습니다.");
      } else {
        // 일반 사용자를 관리자로 승격
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: "admin" },
        });
        console.log("관리자 권한이 부여되었습니다.");
      }
      process.exit(0);
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 계정 생성
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("관리자 계정이 생성되었습니다:");
    console.log(`이메일: ${admin.email}`);
    console.log(`이름: ${admin.name}`);
    console.log(`권한: ${admin.role}`);
  } catch (error) {
    console.error("관리자 계정 생성 오류:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

