// 최근 본 병원 관리 (localStorage)

export interface RecentHospital {
  id: number;
  name: string;
  nameEn?: string;
  city?: string;
  rating?: number;
  viewedAt: string; // ISO timestamp
}

const RECENT_HOSPITALS_KEY = "medmatch_recent_hospitals";
const MAX_RECENT = 10; // 최대 10개까지 저장

// 최근 본 병원 목록 가져오기
export function getRecentHospitals(): RecentHospital[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(RECENT_HOSPITALS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("최근 본 병원 불러오기 실패:", error);
    return [];
  }
}

// 병원 방문 기록 추가
export function addRecentHospital(hospital: Omit<RecentHospital, "viewedAt">): void {
  if (typeof window === "undefined") return;

  try {
    let recents = getRecentHospitals();

    // 이미 있는 병원이면 제거 (나중에 맨 앞에 추가)
    recents = recents.filter((h) => h.id !== hospital.id);

    // 새로운 병원을 맨 앞에 추가
    recents.unshift({
      ...hospital,
      viewedAt: new Date().toISOString(),
    });

    // 최대 개수만 유지
    recents = recents.slice(0, MAX_RECENT);

    localStorage.setItem(RECENT_HOSPITALS_KEY, JSON.stringify(recents));
  } catch (error) {
    console.error("최근 본 병원 저장 실패:", error);
  }
}

// 최근 본 병원 목록 초기화
export function clearRecentHospitals(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(RECENT_HOSPITALS_KEY);
  } catch (error) {
    console.error("최근 본 병원 삭제 실패:", error);
  }
}

