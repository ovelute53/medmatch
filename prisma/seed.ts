import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 시드 데이터 생성 시작...");

  // 기존 데이터 정리 (선택사항)
  console.log("🗑️  기존 데이터 정리 중...");
  await prisma.request.deleteMany();
  await prisma.hospitalDepartment.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.department.deleteMany();

  // 진료과 생성
  console.log("🏥 진료과 생성 중...");
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: "내과",
        nameEn: "Internal Medicine",
        icon: "🫁",
        description: "내과 질환 진료",
      },
    }),
    prisma.department.create({
      data: {
        name: "외과",
        nameEn: "Surgery",
        icon: "⚕️",
        description: "수술 및 외과 질환 진료",
      },
    }),
    prisma.department.create({
      data: {
        name: "정형외과",
        nameEn: "Orthopedics",
        icon: "🦴",
        description: "뼈, 관절, 근육 질환 진료",
      },
    }),
    prisma.department.create({
      data: {
        name: "산부인과",
        nameEn: "Obstetrics and Gynecology",
        icon: "👶",
        description: "여성 건강 및 산과 진료",
      },
    }),
    prisma.department.create({
      data: {
        name: "소아과",
        nameEn: "Pediatrics",
        icon: "👶",
        description: "소아 질환 진료",
      },
    }),
    prisma.department.create({
      data: {
        name: "안과",
        nameEn: "Ophthalmology",
        icon: "👁️",
        description: "눈 질환 진료",
      },
    }),
    prisma.department.create({
      data: {
        name: "이비인후과",
        nameEn: "ENT (Ear, Nose, Throat)",
        icon: "👂",
        description: "귀, 코, 목 질환 진료",
      },
    }),
    prisma.department.create({
      data: {
        name: "치과",
        nameEn: "Dentistry",
        icon: "🦷",
        description: "치아 및 구강 질환 진료",
      },
    }),
    prisma.department.create({
      data: {
        name: "피부과",
        nameEn: "Dermatology",
        icon: "✨",
        description: "피부 질환 진료",
      },
    }),
    prisma.department.create({
      data: {
        name: "정신건강의학과",
        nameEn: "Psychiatry",
        icon: "🧠",
        description: "정신 건강 진료",
      },
    }),
  ]);

  console.log(`✅ ${departments.length}개의 진료과 생성 완료`);

  // 병원 생성
  console.log("🏥 병원 생성 중...");
  const hospitals = await Promise.all([
    prisma.hospital.create({
      data: {
        name: "서울대학교병원",
        nameEn: "Seoul National University Hospital",
        address: "서울특별시 종로구 대학로 101",
        city: "Seoul",
        country: "Korea",
        phone: "+82-2-2072-2114",
        website: "https://www.snuh.org",
        description:
          "서울대학교병원은 환자 중심의 최고 수준의 의료 서비스를 제공합니다. 외국인 환자 통역 서비스 및 다국어 지원을 제공합니다.",
        descriptionEn:
          "Seoul National University Hospital provides world-class patient-centered medical services. We offer translation services and multilingual support for international patients.",
        imageUrl:
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
        rating: 4.8,
        reviewCount: 324,
        departments: {
          create: [
            { departmentId: departments[0].id }, // 내과
            { departmentId: departments[1].id }, // 외과
            { departmentId: departments[2].id }, // 정형외과
            { departmentId: departments[5].id }, // 안과
          ],
        },
      },
    }),
    prisma.hospital.create({
      data: {
        name: "삼성서울병원",
        nameEn: "Samsung Medical Center",
        address: "서울특별시 강남구 일원로 81",
        city: "Seoul",
        country: "Korea",
        phone: "+82-2-3410-2114",
        website: "https://www.samsunghospital.com",
        description:
          "삼성서울병원은 첨단 의료 기술과 환자 중심 서비스를 제공합니다. 국제 환자 센터를 운영하며 24시간 통역 서비스를 제공합니다.",
        descriptionEn:
          "Samsung Medical Center provides advanced medical technology and patient-centered services. We operate an International Healthcare Center with 24/7 translation services.",
        imageUrl:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800",
        rating: 4.9,
        reviewCount: 456,
        departments: {
          create: [
            { departmentId: departments[0].id }, // 내과
            { departmentId: departments[1].id }, // 외과
            { departmentId: departments[3].id }, // 산부인과
            { departmentId: departments[4].id }, // 소아과
            { departmentId: departments[6].id }, // 이비인후과
          ],
        },
      },
    }),
    prisma.hospital.create({
      data: {
        name: "아산서울병원",
        nameEn: "Asan Medical Center",
        address: "서울특별시 송파구 올림픽로43길 88",
        city: "Seoul",
        country: "Korea",
        phone: "+82-2-3010-3114",
        website: "https://www.amc.seoul.kr",
        description:
          "아산서울병원은 환자 안전과 의료 질 향상에 최선을 다합니다. 외국인 환자를 위한 전담 팀이 상주하며 편리한 예약 시스템을 제공합니다.",
        descriptionEn:
          "Asan Medical Center is committed to patient safety and improving medical quality. We have a dedicated team for international patients and offer a convenient reservation system.",
        imageUrl:
          "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
        rating: 4.7,
        reviewCount: 289,
        departments: {
          create: [
            { departmentId: departments[1].id }, // 외과
            { departmentId: departments[2].id }, // 정형외과
            { departmentId: departments[5].id }, // 안과
            { departmentId: departments[7].id }, // 치과
          ],
        },
      },
    }),
    prisma.hospital.create({
      data: {
        name: "세브란스병원",
        nameEn: "Severance Hospital",
        address: "서울특별시 서대문구 연세로 50-1",
        city: "Seoul",
        country: "Korea",
        phone: "+82-2-2228-5800",
        website: "https://www.yuhs.or.kr",
        description:
          "세브란스병원은 130년 전통의 의료 기관으로, 최신 의료 기술과 인성 의료를 실현합니다. 국제 진료 센터를 통해 외국인 환자에게 특화된 서비스를 제공합니다.",
        descriptionEn:
          "Severance Hospital is a 130-year-old medical institution that realizes the latest medical technology and humanistic medicine. We provide specialized services for international patients through our International Healthcare Center.",
        imageUrl:
          "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800",
        rating: 4.6,
        reviewCount: 198,
        departments: {
          create: [
            { departmentId: departments[0].id }, // 내과
            { departmentId: departments[3].id }, // 산부인과
            { departmentId: departments[4].id }, // 소아과
            { departmentId: departments[8].id }, // 피부과
            { departmentId: departments[9].id }, // 정신건강의학과
          ],
        },
      },
    }),
    prisma.hospital.create({
      data: {
        name: "강남세브란스병원",
        nameEn: "Gangnam Severance Hospital",
        address: "서울특별시 강남구 언주로 211",
        city: "Seoul",
        country: "Korea",
        phone: "+82-2-2019-3114",
        website: "https://gs.yuhs.or.kr",
        description:
          "강남세브란스병원은 강남 지역의 대표적인 의료 기관으로, 프리미엄 의료 서비스를 제공합니다. 외국인 환자 전담 데스크를 운영합니다.",
        descriptionEn:
          "Gangnam Severance Hospital is a leading medical institution in Gangnam, providing premium medical services. We operate a dedicated desk for international patients.",
        imageUrl:
          "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800",
        rating: 4.5,
        reviewCount: 167,
        departments: {
          create: [
            { departmentId: departments[2].id }, // 정형외과
            { departmentId: departments[5].id }, // 안과
            { departmentId: departments[6].id }, // 이비인후과
            { departmentId: departments[7].id }, // 치과
            { departmentId: departments[8].id }, // 피부과
          ],
        },
      },
    }),
    prisma.hospital.create({
      data: {
        name: "부산대학교병원",
        nameEn: "Pusan National University Hospital",
        address: "부산광역시 양산시 물금읍 물금리 20",
        city: "Busan",
        country: "Korea",
        phone: "+82-51-240-7114",
        website: "https://www.pnuh.org",
        description:
          "부산대학교병원은 영남 지역의 대표적인 의료 기관입니다. 외국인 환자를 위한 통역 서비스 및 편의 시설을 제공합니다.",
        descriptionEn:
          "Pusan National University Hospital is a leading medical institution in the Yeongnam region. We provide translation services and convenient facilities for international patients.",
        imageUrl:
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
        rating: 4.4,
        reviewCount: 142,
        departments: {
          create: [
            { departmentId: departments[0].id }, // 내과
            { departmentId: departments[1].id }, // 외과
            { departmentId: departments[2].id }, // 정형외과
          ],
        },
      },
    }),
  ]);

  console.log(`✅ ${hospitals.length}개의 병원 생성 완료`);
  console.log("🎉 시드 데이터 생성 완료!");
}

main()
  .catch((e) => {
    console.error("❌ 시드 데이터 생성 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

