// 병원 비교 관리 (localStorage)

export interface ComparisonHospital {
  id: number;
  name: string;
  nameEn?: string;
  city?: string;
  rating?: number;
  addedAt: string; // ISO timestamp
}

const COMPARISON_KEY = "medmatch_comparison_hospitals";
const MAX_COMPARISON = 4; // 최대 4개까지 비교 가능

// 비교 목록 가져오기
export function getComparisonHospitals(): ComparisonHospital[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(COMPARISON_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("비교 목록 불러오기 실패:", error);
    return [];
  }
}

// 비교 목록에 병원 추가
export function addToComparison(hospital: Omit<ComparisonHospital, "addedAt">): boolean {
  if (typeof window === "undefined") return false;

  try {
    let comparisons = getComparisonHospitals();

    // 이미 있는 병원인지 확인
    if (comparisons.some((h) => h.id === hospital.id)) {
      return false; // 이미 추가됨
    }

    // 최대 개수 확인
    if (comparisons.length >= MAX_COMPARISON) {
      return false; // 최대 개수 초과
    }

    // 추가
    comparisons.push({
      ...hospital,
      addedAt: new Date().toISOString(),
    });

    localStorage.setItem(COMPARISON_KEY, JSON.stringify(comparisons));
    return true;
  } catch (error) {
    console.error("비교 목록 추가 실패:", error);
    return false;
  }
}

// 비교 목록에서 병원 제거
export function removeFromComparison(hospitalId: number): void {
  if (typeof window === "undefined") return;

  try {
    let comparisons = getComparisonHospitals();
    comparisons = comparisons.filter((h) => h.id !== hospitalId);
    localStorage.setItem(COMPARISON_KEY, JSON.stringify(comparisons));
  } catch (error) {
    console.error("비교 목록 제거 실패:", error);
  }
}

// 비교 목록 전체 삭제
export function clearComparison(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(COMPARISON_KEY);
  } catch (error) {
    console.error("비교 목록 삭제 실패:", error);
  }
}

// 병원이 비교 목록에 있는지 확인
export function isInComparison(hospitalId: number): boolean {
  const comparisons = getComparisonHospitals();
  return comparisons.some((h) => h.id === hospitalId);
}

// 비교 가능 여부 확인 (최대 개수 미만)
export function canAddToComparison(): boolean {
  const comparisons = getComparisonHospitals();
  return comparisons.length < MAX_COMPARISON;
}

